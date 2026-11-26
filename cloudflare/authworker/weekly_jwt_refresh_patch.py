"""Narrow, idempotent patch for the 7-day website JWT lifecycle.

Changes only the initial website JWT exp created by ncEnqueue and the Mother
website session-token route. Mobile app routes are intentionally untouched.
"""
from __future__ import annotations

WEEKLY_REFRESH_MARKER = "// MOTHER_WEEKLY_JWT_REFRESH_V1"
TOKEN_PATH = 'var TOKEN_PATH = "/api/auth/session-token";'
ROUTE_START = 'app.post(TOKEN_PATH, async (c2) => {'
BETTER_AUTH_ANCHOR = "  const auth = createAuth(c2.env);"

MOTHER_REFRESH = r'''  // MOTHER_WEEKLY_JWT_REFRESH_V1
  const motherRequestUrl = new URL(c2.req.url);
  const motherOriginUrl = new URL(origin);
  const motherHost = motherRequestUrl.hostname.toLowerCase();
  if ((motherHost === "mecopay.space" || motherHost === "www.mecopay.space") &&
      motherOriginUrl.origin === motherRequestUrl.origin) {
    const currentCookie = ncCookie(c2.req.raw, "__Host-mecopay_jwt");
    if (currentCookie) {
      try {
        const current = await mobileVerifyJwt(currentCookie, env2);
        if (current.iss !== env2.BETTER_AUTH_URL ||
            current.surface !== "mother" ||
            current.domain !== "mecopay.space" ||
            current.aud !== "mother-dashboard" ||
            typeof current.sub !== "string" ||
            !/^(email|google|telegram):.+/.test(current.sub)) {
          throw new Error("MOTHER_SESSION_CONTEXT_INVALID");
        }
        const now = Math.floor(Date.now() / 1000);
        const token = await signAuthJwt(env2.JWT_PRIVATE_KEY, {
          ...current,
          iat: now,
          exp: now + JWT_TTL_SECONDS,
          jti: crypto.randomUUID(),
        });
        const refreshed = applyCors(
          c2.json({ token, token_type: "Bearer", expires_in: JWT_TTL_SECONDS }),
          origin
        );
        refreshed.headers.set("Cache-Control", "no-store, max-age=0");
        refreshed.headers.set("Pragma", "no-cache");
        refreshed.headers.append("Set-Cookie", `__Host-mecopay_jwt=${token}; Max-Age=${JWT_TTL_SECONDS}; Path=/; Secure; HttpOnly; SameSite=Lax`);
        return refreshed;
      } catch {
        return applyCors(c2.json({ error: "UNAUTHENTICATED" }, 401), origin);
      }
    }
  }
'''


def _replace_once(source: str, old: str, new: str, label: str) -> str:
    count = source.count(old)
    if count != 1:
        raise ValueError(f"Expected exactly one {label} anchor; found {count}.")
    return source.replace(old, new, 1)


def patch_weekly_website_jwt(source: str) -> str:
    """Set actual website JWT expiry to 7 days and renew Mother JWT cookies."""
    if WEEKLY_REFRESH_MARKER in source:
        return source

    # Only change the Mother/no-code website token minted by ncEnqueue. Do not
    # touch mobile app token TTLs or unrelated temporary OTP/session TTLs.
    start = "async function ncEnqueue(env, identity) {"
    end = "\nasync function ncStoreHandoff"
    if source.count(start) != 1:
        raise ValueError("Could not identify exactly one ncEnqueue function.")
    i = source.index(start)
    j = source.find(end, i)
    if j < 0:
        raise ValueError("Could not find the end of ncEnqueue.")
    enqueue = source[i:j]
    enqueue = _replace_once(
        enqueue,
        "exp: now + NC_TTL",
        "exp: now + JWT_TTL_SECONDS",
        "initial website JWT expiry",
    )
    source = source[:i] + enqueue + source[j:]

    source = _replace_once(
        source,
        TOKEN_PATH,
        WEEKLY_REFRESH_MARKER + "\n" + TOKEN_PATH,
        "weekly refresh version marker",
    )
    if source.count(ROUTE_START) != 1:
        raise ValueError("Could not identify exactly one Mother session-token route.")
    i = source.index(ROUTE_START)
    j = source.find(BETTER_AUTH_ANCHOR, i)
    if j < 0:
        raise ValueError("Could not find the legacy Better Auth fallback in the refresh route.")
    source = source[:j] + MOTHER_REFRESH + source[j:]
    return source
