#!/usr/bin/env python3
"""Deploy only the seven-day website JWT lifecycle fix to Cloudflare authworker.

The script never replaces Telegram, no-code, or mobile route fragments. Run
without --deploy for a dry run; --deploy uploads only after anchors and syntax
checks pass. Cloudflare credentials are read from the environment.
"""
from __future__ import annotations

import argparse
import copy
import os
import shutil
import subprocess
import sys
from pathlib import Path

from deploy_telegram_login import (
    SCRIPT_NAME,
    cloudflare_json,
    extract_worker_source,
    multipart_body,
)
from weekly_jwt_refresh_patch import WEEKLY_REFRESH_MARKER, patch_weekly_website_jwt


def upload_metadata(settings: dict) -> dict:
    """Keep current deployable settings without sending secret values."""
    metadata = {key: copy.deepcopy(value) for key, value in settings.items() if key != "annotations"}
    bindings = metadata.get("bindings") or []
    has_secrets = any(isinstance(item, dict) and item.get("type") == "secret_text" for item in bindings)
    metadata["bindings"] = [item for item in bindings if not (isinstance(item, dict) and item.get("type") == "secret_text")]
    metadata["main_module"] = "index.js"
    if has_secrets:
        metadata["keep_bindings"] = ["secret_text"]
    return metadata


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--deploy", action="store_true", help="upload the patched Worker; default is dry-run")
    args = parser.parse_args()
    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    if not token or not account_id:
        raise RuntimeError("Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the environment.")

    root = Path(__file__).resolve().parent
    api_base = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{SCRIPT_NAME}"
    settings_payload = cloudflare_json(api_base + "/settings", token)
    settings = settings_payload.get("result") or {}
    if settings.get("main_module") not in (None, "index.js"):
        raise RuntimeError("Unexpected Worker main module; refusing a source-only deployment.")
    source = extract_worker_source(api_base, token).decode("utf-8")
    patched = patch_weekly_website_jwt(source)
    if WEEKLY_REFRESH_MARKER not in patched:
        raise RuntimeError("Weekly refresh marker missing after patch.")
    if "exp: now + JWT_TTL_SECONDS" not in patched:
        raise RuntimeError("The initial website JWT still lacks the seven-day exp.")
    if "const MOBILE_APP_TOKEN_TTL = 60 * 60 * 24 * 365 * 10;" in source and "const MOBILE_APP_TOKEN_TTL = 60 * 60 * 24 * 365 * 10;" not in patched:
        raise RuntimeError("Mobile token TTL unexpectedly changed.")
    if source.count("MOBILE_APP_TOKEN_TTL") != patched.count("MOBILE_APP_TOKEN_TTL"):
        raise RuntimeError("Mobile route source unexpectedly changed.")

    preview = root / ".weekly-jwt-refresh-preview.js"
    preview.write_text(patched, encoding="utf-8")
    node = shutil.which("node")
    if node:
        check = subprocess.run([node, "--check", str(preview)], capture_output=True, text=True)
        if check.returncode:
            raise RuntimeError("Node rejected patched Worker JavaScript syntax: " + check.stderr[-1000:])
    metadata = upload_metadata(settings)
    body, content_type = multipart_body(metadata, patched.encode("utf-8"))
    print(f"Prepared narrow Worker patch: {len(source)} -> {len(patched)} bytes; mobile routes unchanged.")
    print(f"Preserved {len(metadata.get('bindings') or [])} non-secret binding descriptors; secret bindings are retained by Cloudflare.")
    if not args.deploy:
        print("Dry run complete; no Cloudflare resources were changed.")
        return 0
    cloudflare_json(api_base, token, "PUT", body, content_type)
    print("Cloudflare authworker weekly website JWT patch uploaded.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Deployment stopped: {error}", file=sys.stderr)
        raise SystemExit(1)
