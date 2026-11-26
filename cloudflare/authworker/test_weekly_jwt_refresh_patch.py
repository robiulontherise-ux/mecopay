from __future__ import annotations

import importlib.util
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("weekly_jwt_refresh_patch.py")
spec = importlib.util.spec_from_file_location("weekly_jwt_refresh_patch", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)

FIXTURE = r'''var JWT_TTL_SECONDS = 7 * 24 * 60 * 60;
var NC_TTL = 5 * 60;
var TOKEN_PATH = "/api/auth/session-token";
async function ncEnqueue(env, identity) {
  const now = Math.floor(Date.now() / 1000);
  const claims = { iss: env.BETTER_AUTH_URL, sub: `${identity.provider}:${identity.providerAccountId}`, aud: identity.surface === 'mother' ? 'mother-dashboard' : 'client-site', iat: now, exp: now + NC_TTL, jti: crypto.randomUUID(), surface: identity.surface === 'mother' ? 'mother' : 'no-code', domain: identity.domain };
  const token = await signAuthJwt(env.JWT_PRIVATE_KEY, claims);
  return { token };
}
async function ncStoreHandoff(env, handoff) { return handoff; }
app.post(TOKEN_PATH, async (c2) => {
  const origin = parseOrigin(c2.req.raw);
  if (!origin) return c2.json({ error: "ORIGIN_NOT_ALLOWED" }, 403);
  const env2 = c2.env;
  if (!env2.JWT_PRIVATE_KEY) return applyCors(c2.json({ error: "JWT_SIGNING_KEY_NOT_CONFIGURED" }, 503), origin);
  if (!env2.BETTER_AUTH_URL) return applyCors(c2.json({ error: "AUTH_ISSUER_NOT_CONFIGURED" }, 503), origin);
  const auth = createAuth(c2.env);
  const session2 = await auth.api.getSession({ headers: c2.req.raw.headers });
  return session2;
});
async function ncTenantSessionToken(c) { return c; }
app.post('/api/auth/tenant/session-token', ncTenantSessionToken);
const MOBILE_APP_TOKEN_TTL = 60 * 60 * 24 * 365 * 10;
'''


def main() -> None:
    result = module.patch_weekly_website_jwt(FIXTURE)
    assert module.WEEKLY_REFRESH_MARKER in result
    assert "exp: now + JWT_TTL_SECONDS" in result
    assert "exp: now + NC_TTL" not in result
    assert "Max-Age=${JWT_TTL_SECONDS}" in result
    assert 'current.iss !== env2.BETTER_AUTH_URL' in result
    assert 'current.surface !== "mother"' in result
    assert 'current.domain !== "mecopay.space"' in result
    assert 'current.aud !== "mother-dashboard"' in result
    assert 'typeof current.sub !== "string"' in result
    assert 'await auth.api.getSession' in result  # keep the legacy fallback
    assert "app.post('/api/auth/tenant/session-token', ncTenantSessionToken);" in result
    assert "const MOBILE_APP_TOKEN_TTL = 60 * 60 * 24 * 365 * 10;" in result
    assert module.patch_weekly_website_jwt(result) == result

    for missing in ("async function ncEnqueue(env, identity) {", 'var TOKEN_PATH = "/api/auth/session-token";'):
        broken = FIXTURE.replace(missing, "", 1)
        try:
            module.patch_weekly_website_jwt(broken)
        except ValueError:
            pass
        else:
            raise AssertionError(f"patch must fail closed when missing: {missing}")
    print("weekly website JWT patch tests passed")


if __name__ == "__main__":
    main()
