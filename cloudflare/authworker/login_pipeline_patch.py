"""Deterministic source transformer for the deployed MecoPay Auth Worker bundle.

The Worker bundle is fetched from Cloudflare by deploy-telegram-login.py; this
module only transforms that source in memory and never reads or writes secrets.
"""
from __future__ import annotations

import re

MARKER = "// AUTH_LOGIN_PIPELINE_V1"


def _replace_once(source: str, old: str, new: str, label: str) -> str:
    count = source.count(old)
    if count != 1:
        raise ValueError(f"Expected exactly one {label} anchor; found {count}.")
    return source.replace(old, new, 1)


def _replace_function(source: str, start: str, end: str, new: str, label: str) -> str:
    if source.count(start) != 1:
        raise ValueError(f"Expected exactly one {label} start anchor.")
    i = source.index(start)
    j = source.find(end, i)
    if j < 0:
        raise ValueError(f"Could not find {label} end anchor.")
    return source[:i] + new + source[j + len(end):]


def patch_auth_worker_source(source: str) -> str:
    """Patch an Auth Worker source bundle once; fail closed on unexpected source."""
    if MARKER in source:
        return source

    source = _replace_once(
        source,
        'async function enqueueLoginProvision(env,sql3,context3,session2,requestedProvider){',
        'async function enqueueLoginProvision(env,sql3,context3,session2,requestedProvider,beforeSend){',
        "enqueueLoginProvision signature",
    )
    source = _replace_once(
        source,
        'jwt_expires_at:session2.session?.expiresAt?new Date(session2.session.expiresAt).toISOString():new Date(Date.now()+1800000).toISOString()',
        'jwt_expires_at:new Date(Date.now()+JWT_TTL_SECONDS*1000).toISOString()',
        "provisioning-event JWT expiry",
    )
    source = _replace_once(
        source,
        "const service=env['SUB_WORKER_'+String(shard).padStart(2,'0')];",
        "if(beforeSend)await beforeSend({provider,providerAccountId,eventId,packet,shard});const service=env['SUB_WORKER_'+String(shard).padStart(2,'0')];",
        "pre-queue signing point",
    )

    old_provision_start = "async function provisionForRequest(env2, request, user2, provider = \"email\") {"
    old_provision_end = '__name(provisionForRequest, "provisionForRequest");'
    new_provision = '''async function provisionForRequest(env2, request, user2, provider = "email", sessionMeta = null, tokenState = null) {
  if (!request) return null;
  if (!env2.JWT_PRIVATE_KEY || !env2.BETTER_AUTH_URL) throw new Error("JWT_SIGNING_KEY_NOT_CONFIGURED");
  const sql3 = getSql(env2);
  try {
    const context3 = await resolveLoginContext(sql3, request);
    const authSession = {
      user: user2,
      session: sessionMeta ? {
        id: sessionMeta.id,
        createdAt: sessionMeta.createdAt,
        expiresAt: sessionMeta.expiresAt
      } : null
    };
    let preparedToken = null;
    await enqueueLoginProvision(env2, sql3, context3, authSession, provider, async (prepared) => {
      let role;
      if (context3.surface === "mother") {
        const rows = await sql3`
          select coalesce(to_jsonb(profile)->>'role', 'customer') as role
          from mecopay_heart.profiles as profile
          where profile.id = ${user2.id}
          limit 1
        `;
        role = rows[0]?.role || "customer";
      } else {
        if (!context3.siteId || !context3.clientId || !context3.brandId) {
          throw new Error("SITE_CONTEXT_INVALID");
        }
        // The validated site context limits this token to the site-customer audience.
        // Consumer creates/updates the membership asynchronously after queue acceptance.
        role = "site_customer";
      }
      const now3 = Math.floor(Date.now() / 1e3);
      const claims = {
        iss: env2.BETTER_AUTH_URL,
        sub: `${prepared.provider}:${prepared.providerAccountId}`,
        aud: context3.surface === "mother" ? "mother-dashboard" : "client-site",
        iat: now3,
        exp: now3 + JWT_TTL_SECONDS,
        jti: prepared.eventId,
        surface: context3.surface === "mother" ? "mother" : "no-code",
        role,
        ...context3.surface === "no_code" ? {
          site_id: context3.siteId,
          client_id: context3.clientId,
          brand_id: context3.brandId
        } : {}
      };
      const token = await signAuthJwt(env2.JWT_PRIVATE_KEY, claims);
      preparedToken = token;
    });
    if (tokenState && preparedToken) {
      tokenState.token = preparedToken;
      tokenState.expiresIn = JWT_TTL_SECONDS;
    }
    return tokenState?.token || null;
  } finally {
    await sql3.end({ timeout: 2 }).catch(() => {});
  }
}
__name(provisionForRequest, "provisionForRequest");'''
    source = _replace_function(source, old_provision_start, old_provision_end, new_provision, "provisionForRequest")

    source = _replace_once(
        source,
        'await provisionForRequest(env2, context3.request, user2, provider);',
        'if (!options.skipLoginProvision) await provisionForRequest(env2, context3.request, user2, provider, session2, options.loginTokenState);',
        "session-create provisioning hook",
    )

    source = _replace_once(
        source,
        'const authResponse = await createAuth(c2.env, { otpStorage }).handler(c2.req.raw);',
        '''const loginTokenState = {};
  let authResponse = await createAuth(c2.env, { otpStorage, loginTokenState }).handler(c2.req.raw);
  if (loginTokenState.token) {
    const headers = new Headers();
    for (const [name, value] of authResponse.headers) {
      if (name.toLowerCase() !== "set-cookie") headers.append(name, value);
    }
    const cookies = authResponse.headers.getSetCookie?.() ?? (authResponse.headers.get("Set-Cookie") ? [authResponse.headers.get("Set-Cookie")] : []);
    for (const cookie of cookies) if (cookie) headers.append("Set-Cookie", cookie);
    headers.append("Set-Cookie", `__Host-mecopay_jwt=${loginTokenState.token}; Max-Age=${loginTokenState.expiresIn}; Path=/; Secure; HttpOnly; SameSite=Lax`);
    authResponse = new Response(authResponse.body, { status: authResponse.status, statusText: authResponse.statusText, headers });
  }''',
        "Auth response JWT cookie handoff",
    )

    source = _replace_once(
        source,
        'const auth = createAuth(env);',
        'const auth = createAuth(env, { skipLoginProvision: true });',
        "Telegram internal Better Auth hook suppression",
    )
    old_telegram_start = '  const authPayload = await signinResponse.clone().json().catch(() => null);'
    old_telegram_end = '  return tgLoginSetCookies(response, cookies);'
    new_telegram_flow = '''  const cookies = tgLoginExtractSetCookies(signinResponse);
  const cookieHeader = tgLoginCookiePairs(cookies);
  if (!cookieHeader) throw new Error('TELEGRAM_SESSION_COOKIE_MISSING');
  const session = await auth.api.getSession({ headers: new Headers({ Cookie: cookieHeader }) });
  const user = session?.user;
  if (!user?.id || !user?.email) throw new Error('TELEGRAM_SESSION_USER_MISSING');
  await tgLoginPersistChatId(env, user.id, telegramUserId, telegramChatId);

  const loginTokenState = {};
  await provisionForRequest(env, context.req.raw, user, 'telegram', session.session, loginTokenState);
  if (typeof loginTokenState.token !== 'string' || !loginTokenState.token) {
    console.error('[telegram-login] Pre-signed login JWT was not produced');
    const failure = new Response(JSON.stringify({ status: 'verified', error: 'JWT_ISSUANCE_FAILED', message: 'Sign-in was verified, but the session token could not be issued. Please retry.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' },
    });
    return tgLoginSetCookies(failure, cookies);
  }
  const response = new Response(JSON.stringify({
    status: 'verified',
    token: loginTokenState.token,
    token_type: 'Bearer',
    expires_in: loginTokenState.expiresIn || JWT_TTL_SECONDS,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' },
  });
  const responseWithSession = tgLoginSetCookies(response, cookies);
  responseWithSession.headers.append('Set-Cookie', `__Host-mecopay_jwt=${loginTokenState.token}; Max-Age=${loginTokenState.expiresIn || JWT_TTL_SECONDS}; Path=/; Secure; HttpOnly; SameSite=Lax`);
  return responseWithSession;'''
    pattern = re.compile(re.escape(old_telegram_start) + r'[\s\S]*?' + re.escape(old_telegram_end))
    source, count = pattern.subn(new_telegram_flow, source, count=1)
    if count != 1:
        raise ValueError("Expected exactly one Telegram token/provisioning flow to replace.")

    source = _replace_once(
        source,
        'const loginProvider = identityRows[0]?.provider || "email";',
        'const rawLoginProvider = identityRows[0]?.provider || "email";\n    const loginProvider = rawLoginProvider === "google" || rawLoginProvider === "telegram" ? rawLoginProvider : "email";',
        "session-token provider normalization",
    )
    source = _replace_once(
        source,
        'const queueAck = await enqueueLoginProvision(env2, sql3, context3, session2, loginProvider);',
        '''const identityRows2 = loginProvider === "email" ? [] : await sql3.unsafe(
      'SELECT "accountId" AS account_id FROM mecopay_auth.account WHERE "userId"=$1 AND "providerId"=$2 LIMIT 1',
      [session2.user.id, loginProvider]
    );
    const providerAccountId = loginProvider === "email"
      ? String(session2.user.email || "").trim().toLowerCase()
      : identityRows2[0]?.account_id;
    if (!providerAccountId) throw new Error("IDENTITY_MAPPING_NOT_FOUND");''',
        "session-token duplicate Queue send",
    )
    source = _replace_once(
        source,
        'sub: `${queueAck.provider}:${queueAck.providerAccountId}`',
        'sub: `${loginProvider}:${providerAccountId}`',
        "session-token provider subject",
    )

    # The session-created hook is the only automatic producer. Retire the old
    # manual endpoint so clients cannot enqueue the same login a second time.
    start = 'app.post("/api/auth/provision", async (c2) => {'
    if source.count(start) != 1:
        raise ValueError("Expected exactly one manual provisioning route.")
    i = source.index(start)
    end = source.find("\n});", i)
    if end < 0:
        raise ValueError("Could not identify the end of the manual provisioning route.")
    replacement = '''app.post("/api/auth/provision", async (c2) => {
  const auth = createAuth(c2.env, { skipLoginProvision: true });
  const session2 = await auth.api.getSession({ headers: c2.req.raw.headers });
  if (!session2) return c2.json({ error: "UNAUTHENTICATED" }, 401);
  return c2.json({ error: "PROVISIONING_HANDLED_AT_SESSION_CREATE" }, 410);
});'''
    source = source[:i] + replacement + source[end + len("\n});"):]

    source = source.replace(
        'var JWT_TTL_SECONDS = 5 * 60;',
        'var JWT_TTL_SECONDS = 5 * 60;\n' + MARKER,
        1,
    )
    return source


def main() -> int:
    import argparse
    from pathlib import Path

    parser = argparse.ArgumentParser(description="Patch a downloaded Auth Worker bundle.")
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    raw = args.source.read_text(encoding="utf-8")
    patched = patch_auth_worker_source(raw)
    args.output.write_text(patched, encoding="utf-8")
    print(f"Patched Auth Worker source: {len(raw)} -> {len(patched)} characters; idempotent={patch_auth_worker_source(patched) == patched}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
