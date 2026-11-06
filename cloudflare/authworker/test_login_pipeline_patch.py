from __future__ import annotations

import importlib.util
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("login_pipeline_patch.py")
spec = importlib.util.spec_from_file_location("login_pipeline_patch", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)

FIXTURE = r'''async function enqueueLoginProvision(env,sql3,context3,session2,requestedProvider){const provider=requestedProvider;const packet={jwt_expires_at:session2.session?.expiresAt?new Date(session2.session.expiresAt).toISOString():new Date(Date.now()+1800000).toISOString()};const service=env['SUB_WORKER_'+String(shard).padStart(2,'0')];const resp=await service.fetch(new Request('https://example'));return {eventId,providerAccountId}}
__name(enqueueLoginProvision, "enqueueLoginProvision");
async function provisionForRequest(env2, request, user2, provider = "email") { if (!request) return; const sql3 = getSql(env2); try { const context3 = await resolveLoginContext(sql3, request); await enqueueLoginProvision(env2, sql3, context3, { user: user2, session: null }, provider); } finally { await sql3.end({ timeout: 2 }).catch(() => {}); } }
__name(provisionForRequest, "provisionForRequest");
async function afterSession(session2,user2,context3,env2,options){await provisionForRequest(env2, context3.request, user2, provider);}
async function authRoute(c2){const otpStorage=false;const authResponse = await createAuth(c2.env, { otpStorage }).handler(c2.req.raw);return authResponse;}
async function tokenRoute(env2,sql3,context3,session2){const loginProvider = identityRows[0]?.provider || "email";const queueAck = await enqueueLoginProvision(env2, sql3, context3, session2, loginProvider);const claims={sub: `${queueAck.provider}:${queueAck.providerAccountId}`};}
app.post("/api/auth/provision", async (c2) => {
  const auth = createAuth(c2.env);
  const session2 = await auth.api.getSession({ headers: c2.req.raw.headers });
  if (!session2) return c2.json({ error: "UNAUTHENTICATED" }, 401);
  const body = await c2.req.json().catch(() => ({}));
  const provider = body.provider ?? "email";
  const sql3 = getSql(c2.env);
  try {
    const context3 = await resolveLoginContext(sql3, c2.req.raw);
    await enqueueLoginProvision(c2.env, sql3, context3, session2, provider);
    return c2.json({ ok: true, surface: context3.surface });
  } finally {
    await sql3.end({ timeout: 2 }).catch(() => {});
  }
});
var JWT_TTL_SECONDS = 5 * 60;
async function telegramIssue(env,context,signinResponse,requestUrl){
  const auth = createAuth(env);
  const authPayload = await signinResponse.clone().json().catch(() => null);
  const user = authPayload?.user;
  if (!user?.id || !user?.email) throw new Error('TELEGRAM_SESSION_USER_MISSING');
  await tgLoginPersistChatId(env, user.id, telegramUserId, telegramChatId);
  await provisionForRequest(env, context.req.raw, user, 'telegram');
  const cookies = tgLoginExtractSetCookies(signinResponse);
  const cookieHeader = tgLoginCookiePairs(cookies);
  if (!cookieHeader) throw new Error('TELEGRAM_SESSION_COOKIE_MISSING');
  const tokenRequest = new Request(new URL(TOKEN_PATH, requestUrl.origin), {method:'POST'});
  const tokenResponse = await app.fetch(tokenRequest, env, context.executionCtx);
  const tokenPayload = await tokenResponse.json().catch(() => null);
  if (!tokenResponse.ok || typeof tokenPayload?.token !== 'string') throw new Error('TOKEN_FAILED');
  const response = new Response(JSON.stringify({token:tokenPayload.token}));
  return tgLoginSetCookies(response, cookies);
}
'''


def main() -> None:
    result = module.patch_auth_worker_source(FIXTURE)
    assert module.MARKER in result
    assert module.patch_auth_worker_source(result) == result
    assert 'await provisionForRequest(env2, context3.request, user2, provider);' not in result
    assert 'const queueAck = await enqueueLoginProvision(env2, sql3, context3, session2, loginProvider);' not in result
    assert 'sub: `${loginProvider}:${providerAccountId}`' in result
    assert 'PROVISIONING_HANDLED_AT_SESSION_CREATE' in result
    assert 'skipLoginProvision: true' in result
    assert 'TOKEN_PATH' not in result
    assert result.index('if(beforeSend)await beforeSend') < result.index("const service=env['SUB_WORKER_")
    provision = result[result.index('async function provisionForRequest'):result.index('__name(provisionForRequest')]
    assert 'const token = await signAuthJwt(env2.JWT_PRIVATE_KEY, claims);' in provision
    assert 'preparedToken = token;' in provision
    assert provision.index('await enqueueLoginProvision') < provision.index('tokenState.token = preparedToken;')
    assert result.index('if(beforeSend)await beforeSend') < result.index('const resp=await service.fetch')
    Path('/tmp/auth-worker-patched-fixture.js').write_text(result, encoding='utf-8')
    print('auth login-pipeline transformer tests passed')


if __name__ == '__main__':
    main()
