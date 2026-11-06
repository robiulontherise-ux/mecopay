#!/usr/bin/env python3
"""Patch the existing Cloudflare authworker with the single-event login pipeline and Telegram flow.

Requires CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the environment.
The script preserves existing bindings/settings, never prints binding values,
uses anchor-checked source transformations, and only changes the Telegram webhook
when --set-webhook is explicitly passed.
"""
from __future__ import annotations

import argparse
import base64
import copy
import email
import email.policy
import hashlib
import hmac
import json
import os
import shutil
import sys
import subprocess
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

from login_pipeline_patch import patch_auth_worker_source

SCRIPT_NAME = "authworker"
ROUTE_ANCHOR = 'app.get("/api/auth/google/start", async (c2) => {'
TELEGRAM_FRAGMENT_MARKER = "// Telegram login routes for the existing MecoPay Auth Worker."
TELEGRAM_USERNAME = "MecoPay_Authentication_bot"
TELEGRAM_WEBHOOK_PATH = "/api/auth/telegram/webhook"


def api_request(url: str, token: str, method: str = "GET", data: bytes | None = None,
                content_type: str | None = None) -> tuple[int, str, bytes]:
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    if content_type:
        headers["Content-Type"] = content_type
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return response.status, response.headers.get("Content-Type", ""), response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.headers.get("Content-Type", ""), error.read()


def cloudflare_json(url: str, token: str, method: str = "GET", data: bytes | None = None,
                    content_type: str | None = None) -> dict:
    status, _, raw = api_request(url, token, method, data, content_type)
    try:
        payload = json.loads(raw)
    except Exception:
        payload = {}
    if status < 200 or status >= 300 or not payload.get("success"):
        errors = payload.get("errors") or []
        safe_errors = [{"code": item.get("code"), "message": item.get("message")}
                       for item in errors if isinstance(item, dict)]
        raise RuntimeError(f"Cloudflare API request failed (HTTP {status}): {json.dumps(safe_errors)}")
    return payload


def extract_worker_source(url: str, token: str) -> bytes:
    status, content_type, raw = api_request(url, token)
    if status != 200:
        raise RuntimeError(f"Could not read the current Worker source (HTTP {status}).")
    message = email.message_from_bytes(
        b"Content-Type: " + content_type.encode() + b"\r\nMIME-Version: 1.0\r\n\r\n" + raw,
        policy=email.policy.default,
    )
    if not message.is_multipart():
        raise RuntimeError("Cloudflare returned an unexpected Worker source format.")
    for part in message.iter_parts():
        name = part.get_param("name", header="content-disposition") or part.get_filename() or ""
        if name == "index.js":
            data = part.get_payload(decode=True) or b""
            if not data:
                raise RuntimeError("The current Worker source was empty.")
            return data
    raise RuntimeError("Cloudflare response did not contain the current index.js bundle.")


def multipart_body(metadata: dict, source: bytes) -> tuple[bytes, str]:
    boundary = "----mecopay-telegram-" + uuid.uuid4().hex
    chunks = [
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"metadata\"; filename=\"metadata.json\"\r\nContent-Type: application/json\r\n\r\n".encode(),
        json.dumps(metadata, separators=(",", ":")).encode(),
        f"\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"index.js\"; filename=\"index.js\"\r\nContent-Type: application/javascript+module\r\n\r\n".encode(),
        source,
        f"\r\n--{boundary}--\r\n".encode(),
    ]
    return b"".join(chunks), f"multipart/form-data; boundary={boundary}"


def safe_settings_metadata(settings: dict) -> dict:
    # Settings values are copied in memory only. Never print or persist this object;
    # plain-text values may include existing credentials in this legacy Worker.
    current_bindings = copy.deepcopy(settings.get("bindings") or [])
    has_secret_bindings = any(
        isinstance(item, dict) and item.get("type") == "secret_text"
        for item in current_bindings
    )
    # Secret values are intentionally omitted. Cloudflare retains bindings of
    # this type from the previous upload when keep_bindings includes secret_text.
    bindings = [item for item in current_bindings
                if not (isinstance(item, dict) and item.get("type") == "secret_text")]
    username_binding = next((item for item in bindings
                             if isinstance(item, dict) and item.get("name") == "TELEGRAM_BOT_USERNAME"), None)
    if username_binding:
        if username_binding.get("type") != "plain_text":
            raise RuntimeError("TELEGRAM_BOT_USERNAME exists with an unexpected binding type.")
        username_binding["text"] = TELEGRAM_USERNAME
    else:
        bindings.append({"type": "plain_text", "name": "TELEGRAM_BOT_USERNAME", "text": TELEGRAM_USERNAME})

    # Copy every deployable field returned by the settings endpoint; annotations
    # are server-generated and are not script-upload metadata.
    metadata = {key: copy.deepcopy(value) for key, value in settings.items() if key != "annotations"}
    metadata["main_module"] = "index.js"
    metadata["bindings"] = bindings
    if has_secret_bindings:
        metadata["keep_bindings"] = ["secret_text"]
    return metadata


def binding_text(bindings: list[dict], name: str) -> str:
    item = next((binding for binding in bindings
                 if isinstance(binding, dict) and binding.get("name") == name), None)
    if not item or item.get("type") != "plain_text" or not isinstance(item.get("text"), str) or not item["text"]:
        raise RuntimeError(f"Required Worker binding {name} is missing or not plain_text.")
    return item["text"]


def telegram_request(token: str, method: str, payload: dict | None = None) -> dict:
    url = f"https://api.telegram.org/bot{token}/{method}"
    data = None if payload is None else json.dumps(payload).encode()
    request = urllib.request.Request(url, data=data,
                                    headers={"Accept": "application/json", "Content-Type": "application/json"},
                                    method="POST" if payload is not None else "GET")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.loads(response.read())
    except urllib.error.HTTPError as error:
        try:
            result = json.loads(error.read())
        except Exception:
            result = {}
        raise RuntimeError(f"Telegram {method} failed (HTTP {error.code}, ok={result.get('ok')}).")
    if not result.get("ok"):
        raise RuntimeError(f"Telegram {method} returned ok=false.")
    return result.get("result") or {}


def configure_webhook(settings: dict) -> None:
    bindings = settings.get("bindings") or []
    bot_token = binding_text(bindings, "TELEGRAM_BOT_TOKEN")
    auth_url = binding_text(bindings, "BETTER_AUTH_URL")
    bot = telegram_request(bot_token, "getMe")
    if bot.get("username") != TELEGRAM_USERNAME:
        raise RuntimeError("The configured Telegram bot username does not match the expected MecoPay login bot.")
    parsed = urllib.parse.urlparse(auth_url)
    if parsed.scheme != "https" or parsed.hostname not in ("mecopay.space", "www.mecopay.space"):
        raise RuntimeError("BETTER_AUTH_URL must be the official HTTPS MecoPay origin before configuring the bot.")
    webhook_url = f"{parsed.scheme}://{parsed.netloc}{TELEGRAM_WEBHOOK_PATH}"
    existing = telegram_request(bot_token, "getWebhookInfo")
    existing_url = existing.get("url") or ""
    if existing_url and existing_url != webhook_url:
        raise RuntimeError("The bot already has a different webhook URL; refusing to replace it automatically.")
    secret = base64.urlsafe_b64encode(
        hmac.new(bot_token.encode(), b"mecopay-telegram-webhook:v1", hashlib.sha256).digest()
    ).decode().rstrip("=")
    telegram_request(bot_token, "setWebhook", {
        "url": webhook_url,
        "secret_token": secret,
        "allowed_updates": ["message"],
        "drop_pending_updates": False,
    })
    verified = telegram_request(bot_token, "getWebhookInfo")
    if verified.get("url") != webhook_url:
        raise RuntimeError("Telegram did not report the configured MecoPay webhook URL after setup.")
    print("Telegram webhook configured and verified.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--deploy", action="store_true", help="upload the patched Worker script")
    parser.add_argument("--set-webhook", action="store_true", help="configure Telegram webhook after a successful deploy")
    parser.add_argument("--dry-run", action="store_true", help="fetch and prepare without uploading (default)")
    args = parser.parse_args()
    if args.set_webhook and not args.deploy:
        parser.error("--set-webhook requires --deploy")
    if not args.deploy and not args.dry_run:
        args.dry_run = True

    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    if not token or not account_id:
        raise RuntimeError("Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the environment.")

    root = Path(__file__).resolve().parent
    fragment_path = root / "telegram-login-routes.js"
    fragment = fragment_path.read_bytes()
    api_base = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{SCRIPT_NAME}"
    settings_payload = cloudflare_json(api_base + "/settings", token)
    settings = settings_payload.get("result") or {}
    source = extract_worker_source(api_base, token)

    source_text = source.decode("utf-8")
    source_text = patch_auth_worker_source(source_text)
    telegram_route = "app.post('/api/auth/telegram/request-link', tgLoginRequestLink);"
    if source_text.count(ROUTE_ANCHOR) != 1:
        raise RuntimeError("Could not identify one unique insertion point in the current Worker source.")

    if TELEGRAM_FRAGMENT_MARKER in source_text:
        if source_text.count(TELEGRAM_FRAGMENT_MARKER) != 1:
            raise RuntimeError("The current Worker contains duplicate Telegram fragment markers.")
        start = source_text.index(TELEGRAM_FRAGMENT_MARKER)
        end = source_text.index(ROUTE_ANCHOR, start)
        existing_fragment = source_text[start:end]
        if telegram_route not in existing_fragment:
            raise RuntimeError("The marked Telegram fragment is incomplete; refusing to replace it.")
        patched_text = source_text[:start] + fragment.decode("utf-8").rstrip() + "\n" + source_text[end:]
        patched = patched_text.encode()
        print("Updated the existing marked Telegram login fragment.")
    elif telegram_route in source_text:
        raise RuntimeError("Telegram routes exist without the expected marker; refusing an unsafe patch.")
    else:
        patched_text = source_text.replace(ROUTE_ANCHOR, fragment.decode("utf-8") + "\n" + ROUTE_ANCHOR, 1)
        patched = patched_text.encode()
        print("Inserted the Telegram login fragment into the existing Auth Worker.")

    metadata = safe_settings_metadata(settings)
    body, content_type = multipart_body(metadata, patched)
    preview_path = Path("/tmp/mecopay-authworker-telegram-preview.js")
    preview_path.write_bytes(patched)
    print(f"Prepared Worker source: {len(patched)} bytes; Telegram routes present: {patched.count(b'/api/auth/telegram/') // 1}; preview: {preview_path}")
    binding_summary = ", ".join(
        f"{item.get('name')}:{item.get('type')}"
        for item in metadata.get("bindings", []) if isinstance(item, dict)
    )
    print(f"Binding descriptors in upload (values hidden): {binding_summary}")
    print(f"Cloudflare keep_bindings: {metadata.get('keep_bindings', [])}")
    node = shutil.which("node")
    if node:
        check = subprocess.run([node, "--check", str(preview_path)], capture_output=True, text=True)
        if check.returncode:
            raise RuntimeError("Node rejected the patched Worker JavaScript syntax.")
        print("Patched Worker JavaScript syntax: OK")
    else:
        print("Node.js not found; Worker syntax check skipped.")
    print("Existing secret_text bindings are preserved by Cloudflare without re-sending their values.")
    print("Other deployable settings are preserved; plain-text values were not printed.")

    if args.deploy:
        cloudflare_json(api_base, token, "PUT", body, content_type)
        print("Cloudflare authworker script uploaded successfully.")
        if args.set_webhook:
            configure_webhook(settings)
    else:
        print("Dry run only; no Cloudflare or Telegram settings were changed.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Deployment stopped: {error}", file=sys.stderr)
        raise SystemExit(1)
