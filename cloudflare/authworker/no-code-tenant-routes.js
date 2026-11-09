// No-code tenant authentication routes. Mother-site routes remain unchanged.
const NC_TTL = 5 * 60;
const NC_FLOW_COOKIE = '__Host-mecopay_no_code_flow';
const ncEncoder = new TextEncoder();

function ncB64(bytes) { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }
function ncUnb64(value) { const s = value.replace(/-/g, '+').replace(/_/g, '/'); const padded = s + '='.repeat((4 - s.length % 4) % 4); const raw = atob(padded); return Uint8Array.from(raw, c => c.charCodeAt(0)); }
function ncRandom() { const b = new Uint8Array(32); crypto.getRandomValues(b); return ncB64(b); }
async function ncHash(value) { return ncB64(new Uint8Array(await crypto.subtle.digest('SHA-256', ncEncoder.encode(value)))); }
function ncOtp() { const bytes = new Uint32Array(1); crypto.getRandomValues(bytes); return String(100000 + (bytes[0] % 900000)); }
function ncJson(c, payload, status = 200) { const r = c.json(payload, status); r.headers.set('Cache-Control', 'no-store, max-age=0'); r.headers.set('Pragma', 'no-cache'); return r; }
function ncHost(request) { return new URL(request.url).hostname.toLowerCase(); }
function ncReturnTo(value) { if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/'; return value; }
function ncCookie(request, name) { const raw = request.headers.get('Cookie') || ''; for (const p of raw.split(';')) { const i = p.indexOf('='); if (i >= 0 && p.slice(0, i).trim() === name) return p.slice(i + 1).trim(); } return null; }
function ncNoCodeOrigin(request) { const u = new URL(request.url); return u.protocol === 'https:' && u.hostname !== 'mecopay.space' && u.hostname !== 'www.mecopay.space'; }
function ncSetJwt(response, token, expiresIn = NC_TTL) { response.headers.append('Set-Cookie', `__Host-mecopay_jwt=${token}; Max-Age=${expiresIn}; Path=/; Secure; HttpOnly; SameSite=Lax`); return response; }

async function ncVerifyGoogleJwt(token, expectedNonce, clientId) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('GOOGLE_ID_TOKEN_INVALID');
  const header = JSON.parse(new TextDecoder().decode(ncUnb64(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(ncUnb64(parts[1])));
  if (header.alg !== 'RS256' || !claims.sub || !claims.email || claims.iss !== 'https://accounts.google.com' && claims.iss !== 'accounts.google.com' || claims.aud !== clientId || claims.exp <= Math.floor(Date.now() / 1000) || claims.nonce !== expectedNonce || claims.email_verified !== true) throw new Error('GOOGLE_ID_TOKEN_CLAIMS_INVALID');
  const keys = await (await fetch('https://www.googleapis.com/oauth2/v3/certs', { cf: { cacheTtl: 300 } })).json();
  const jwk = keys.keys?.find(k => k.kid === header.kid);
  if (!jwk) throw new Error('GOOGLE_SIGNING_KEY_NOT_FOUND');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, key, ncUnb64(parts[2]), ncEncoder.encode(`${parts[0]}.${parts[1]}`));
  if (!valid) throw new Error('GOOGLE_ID_TOKEN_SIGNATURE_INVALID');
  return claims;
}

async function ncEnqueue(env, identity) {
  const eventId = crypto.randomUUID();
  const shardHash = new DataView(await crypto.subtle.digest('SHA-256', ncEncoder.encode(`${identity.provider}:${identity.providerAccountId}`))).getUint32(0, false) % 10;
  const packet = {
    event_type: 'login_provision', schema_version: 1, event_id: eventId,
    provider: identity.provider, provider_account_id: identity.providerAccountId,
    email: identity.email || null, email_verified: identity.emailVerified !== false,
    name: String(identity.name || 'MecoPay User').slice(0, 200), image: identity.image || null,
    surface: 'no_code', domain: identity.domain, last_login_origin: identity.origin,
    handoff_id: eventId, return_to: identity.returnTo || '/',
    jwt_jti: eventId, jwt_expires_at: new Date(Date.now() + NC_TTL * 1000).toISOString(),
    telegram_chat_id: identity.telegramChatId || null,
  };
  const now = Math.floor(Date.now() / 1000);
  const claims = { iss: env.BETTER_AUTH_URL, sub: `${identity.provider}:${identity.providerAccountId}`, aud: 'client-site', iat: now, exp: now + NC_TTL, jti: eventId, surface: 'no-code', role: 'site_customer', email: identity.email || null, name: packet.name, image: packet.image, domain: identity.domain };
  const token = await signAuthJwt(env.JWT_PRIVATE_KEY, claims);
  const service = env[`SUB_WORKER_${String(shardHash).padStart(2, '0')}`];
  if (!service) throw new Error('SUB_WORKER_BINDING_MISSING');
  const resp = await service.fetch(new Request('https://login-provision.internal/submit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(packet) }));
  const ack = await resp.json().catch(() => ({}));
  if (!resp.ok || ack.accepted !== true || ack.event_id !== eventId) throw new Error('QUEUE_ENQUEUE_FAILED');
  return { token, eventId, identity, expiresAt: Date.now() + NC_TTL * 1000 };
}

async function ncStoreHandoff(env, handoff) {
  const storage = createOtpSecondaryStorage(env.OTP_STORE);
  await storage.set(`no-code:handoff:${handoff.eventId}`, JSON.stringify(handoff), NC_TTL);
}
async function ncConsumeHandoff(c) {
  const code = c.req.query('handoff');
  if (!code || !/^[0-9a-f-]{36}$/i.test(code)) return ncJson(c, { error: 'INVALID_HANDOFF' }, 400);
  const storage = createOtpSecondaryStorage(c.env.OTP_STORE);
  const raw = await storage.getAndDelete(`no-code:handoff:${code}`);
  let handoff; try { handoff = raw ? JSON.parse(raw) : null; } catch { handoff = null; }
  if (!handoff || handoff.expiresAt <= Date.now()) return ncJson(c, { error: 'HANDOFF_EXPIRED' }, 410);
  if (handoff.identity?.domain !== ncHost(c.req.raw)) return ncJson(c, { error: 'HANDOFF_HOST_MISMATCH' }, 403);
  const response = new Response(null, { status: 302, headers: { Location: ncReturnTo(handoff.identity.returnTo) } });
  ncSetJwt(response, handoff.token);
  return response;
}

async function ncGoogleStart(c) {
  if (!ncNoCodeOrigin(c.req.raw)) return ncJson(c, { error: 'NO_CODE_ORIGIN_REQUIRED' }, 403);
  if (!c.env.GOOGLE_CLIENT_ID || !c.env.BETTER_AUTH_URL || !c.env.OTP_STORE) return ncJson(c, { error: 'GOOGLE_LOGIN_NOT_CONFIGURED' }, 503);
  const state = ncRandom(), verifier = ncRandom(), nonce = ncRandom(), domain = ncHost(c.req.raw);
  const storage = createOtpSecondaryStorage(c.env.OTP_STORE);
  const returnTo = ncReturnTo(c.req.query('returnTo') || '/');
  await storage.set(`no-code:google:${state}`, JSON.stringify({ state, verifier, nonce, domain, returnTo, createdAt: Date.now(), expiresAt: Date.now() + NC_TTL * 1000 }), NC_TTL);
  const digest = await crypto.subtle.digest('SHA-256', ncEncoder.encode(verifier));
  const challenge = ncB64(new Uint8Array(digest));
  const callback = `${c.env.BETTER_AUTH_URL.replace(/\/$/, '')}/api/auth/tenant/callback/google`;
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({ response_type: 'code', client_id: c.env.GOOGLE_CLIENT_ID, redirect_uri: callback, scope: 'openid email profile', state, nonce, code_challenge: challenge, code_challenge_method: 'S256', prompt: 'select_account' }).toString();
  return new Response(null, { status: 302, headers: { Location: url.toString(), 'Cache-Control': 'no-store' } });
}
async function ncGoogleCallback(c) {
  const state = c.req.query('state') || '', code = c.req.query('code') || '', error = c.req.query('error');
  const storage = createOtpSecondaryStorage(c.env.OTP_STORE);
  const raw = await storage.getAndDelete(`no-code:google:${state}`);
  let flow; try { flow = raw ? JSON.parse(raw) : null; } catch { flow = null; }
  if (error || !flow || !code || flow.expiresAt <= Date.now()) return new Response(error ? `Google sign-in cancelled: ${error}` : 'Google sign-in state expired.', { status: 400 });
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: c.env.GOOGLE_CLIENT_ID, client_secret: c.env.GOOGLE_CLIENT_SECRET, redirect_uri: `${c.env.BETTER_AUTH_URL.replace(/\/$/, '')}/api/auth/tenant/callback/google`, grant_type: 'authorization_code', code_verifier: flow.verifier }).toString() });
  const tokens = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokens.id_token) return new Response('Google token exchange failed.', { status: 502 });
  try {
    const google = await ncVerifyGoogleJwt(tokens.id_token, flow.nonce, c.env.GOOGLE_CLIENT_ID);
    const handoff = await ncEnqueue(c.env, { provider: 'google', providerAccountId: google.sub, email: String(google.email).toLowerCase(), emailVerified: true, name: google.name || google.email, image: google.picture || null, domain: flow.domain, origin: `https://${flow.domain}`, returnTo: flow.returnTo });
    await ncStoreHandoff(c.env, handoff);
    return new Response(null, { status: 302, headers: { Location: `https://${flow.domain}/api/auth/tenant/consume?handoff=${handoff.eventId}`, 'Cache-Control': 'no-store' } });
  } catch (e) { console.error('[no-code-google]', e instanceof Error ? e.message : 'unknown'); return new Response('Google identity verification failed.', { status: 401 }); }
}

async function ncEmailStart(c) {
  if (!ncNoCodeOrigin(c.req.raw) || !c.env.EMAIL_OTP_SENDER || !c.env.OTP_STORE) return ncJson(c, { error: 'EMAIL_LOGIN_NOT_CONFIGURED' }, 503);
  const body = await c.req.json().catch(() => ({})); const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return ncJson(c, { error: 'INVALID_EMAIL' }, 400);
  const otp = ncOtp(); const flowId = crypto.randomUUID(); const storage = createOtpSecondaryStorage(c.env.OTP_STORE);
  await storage.set(`no-code:email:${flowId}`, JSON.stringify({ flowId, email, otpHash: await ncHash(`no-code-email:${flowId}:${otp}`), domain: ncHost(c.req.raw), returnTo: ncReturnTo(body.returnTo || '/'), expiresAt: Date.now() + NC_TTL * 1000 }), NC_TTL);
  await c.env.EMAIL_OTP_SENDER.send({ to: email, from: { email: 'auth@mecopay.space', name: 'MecoPay Authentication' }, subject: 'MecoPay no-code sign-in code', text: `Your MecoPay sign-in code is ${otp}. It expires in five minutes.` });
  return ncJson(c, { ok: true, flowId, expiresIn: NC_TTL });
}
async function ncEmailVerify(c) {
  if (!ncNoCodeOrigin(c.req.raw)) return ncJson(c, { error: 'NO_CODE_ORIGIN_REQUIRED' }, 403);
  const body = await c.req.json().catch(() => ({})); const flowId = typeof body.flowId === 'string' ? body.flowId : ''; const otp = typeof body.otp === 'string' ? body.otp.trim() : '';
  const storage = createOtpSecondaryStorage(c.env.OTP_STORE); const raw = await storage.get(`no-code:email:${flowId}`); let flow; try { flow = raw ? JSON.parse(raw) : null; } catch { flow = null; }
  if (!flow || flow.expiresAt <= Date.now() || !(await ncHash(`no-code-email:${flowId}:${otp}`) === flow.otpHash)) return ncJson(c, { error: 'INVALID_OR_EXPIRED_OTP' }, 401);
  const consumed = await storage.getAndDelete(`no-code:email:${flowId}`); if (!consumed) return ncJson(c, { error: 'OTP_ALREADY_USED' }, 410);
  try { const handoff = await ncEnqueue(c.env, { provider: 'email', providerAccountId: flow.email, email: flow.email, emailVerified: true, name: flow.email.split('@')[0], domain: flow.domain, origin: `https://${flow.domain}`, returnTo: flow.returnTo }); const response = ncJson(c, { ok: true, status: 'verified', token: handoff.token, token_type: 'Bearer', expires_in: NC_TTL }); return ncSetJwt(response, handoff.token); } catch (e) { console.error('[no-code-email]', e instanceof Error ? e.message : 'unknown'); return ncJson(c, { error: 'QUEUE_ENQUEUE_FAILED' }, 503); }
}

function ncSignOut(c) {
  if (!ncNoCodeOrigin(c.req.raw)) return ncJson(c, { error: 'NO_CODE_ORIGIN_REQUIRED' }, 403);
  const response = ncJson(c, { ok: true, status: 'signed_out' });
  for (const name of ['__Host-mecopay_jwt', '__Host-mecopay_no_code_flow', '__Host-mecopay_tg_flow']) {
    response.headers.append('Set-Cookie', `${name}=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax`);
  }
  return response;
}

async function ncTelegramRequest(c) {
  if (!ncNoCodeOrigin(c.req.raw)) return ncJson(c, { error: 'NO_CODE_ORIGIN_REQUIRED' }, 403);
  const flow = await tgLoginCreateSession(c.req.raw, c.env); const storage = createOtpSecondaryStorage(c.env.OTP_STORE); const challengeId = crypto.randomUUID(); const startToken = tgLoginRandomToken(); const startHash = await tgLoginHash(startToken); const now = Date.now();
  const challenge = { challengeId, sessionId: flow.sessionId, startHash, createdAt: now, expiresAt: now + NC_TTL * 1000, confirmed: false, telegramUserId: null, telegramName: null, telegramChatId: null, noCode: true, domain: ncHost(c.req.raw), returnTo: ncReturnTo((await c.req.json().catch(() => ({}))).returnTo || '/') };
  await storage.set(tgLoginChallengeKey(challengeId), JSON.stringify(challenge), NC_TTL); await storage.set(tgLoginStartKey(startHash), challengeId, NC_TTL);
  const response = ncJson(c, { challengeId, loginUrl: `https://t.me/${String(c.env.TELEGRAM_BOT_USERNAME).replace(/^@/, '')}?start=${startToken}`, expiresAt: challenge.expiresAt }); if (flow.setCookie) response.headers.append('Set-Cookie', flow.setCookie); return response;
}
async function ncTelegramVerify(c) {
  if (!ncNoCodeOrigin(c.req.raw)) return ncJson(c, { error: 'NO_CODE_ORIGIN_REQUIRED' }, 403); const sessionId = await tgLoginReadSession(c.req.raw, c.env); if (!sessionId) return ncJson(c, { error: 'LOGIN_FLOW_EXPIRED' }, 401); const body = await c.req.json().catch(() => ({})); const id = body.challengeId; const storage = createOtpSecondaryStorage(c.env.OTP_STORE); const raw = await storage.get(tgLoginChallengeKey(id)); let ch; try { ch = raw ? JSON.parse(raw) : null; } catch { ch = null; }
  if (!ch || !ch.noCode || ch.sessionId !== sessionId || ch.expiresAt <= Date.now()) return ncJson(c, { error: 'CHALLENGE_EXPIRED' }, 410); if (!ch.confirmed || !ch.telegramUserId) return ncJson(c, { status: 'pending' }); const consumed = tgLoginParseChallenge(await storage.getAndDelete(tgLoginChallengeKey(id))); if (!consumed) return ncJson(c, { error: 'CHALLENGE_ALREADY_USED' }, 410);
  try { const handoff = await ncEnqueue(c.env, { provider: 'telegram', providerAccountId: String(consumed.telegramUserId), email: `telegram-${consumed.telegramUserId}@users.invalid`, emailVerified: false, name: consumed.telegramName, telegramChatId: consumed.telegramChatId, domain: consumed.domain, origin: `https://${consumed.domain}`, returnTo: consumed.returnTo }); const response = ncJson(c, { status: 'verified' }); if (ch.setCookie) response.headers.append('Set-Cookie', ch.setCookie); return ncSetJwt(response, handoff.token); } catch (e) { console.error('[no-code-telegram]', e instanceof Error ? e.message : 'unknown'); return ncJson(c, { error: 'QUEUE_ENQUEUE_FAILED' }, 503); }
}

function ncDecodeJwt(value) { try { const p = value.split('.')[1]; return JSON.parse(new TextDecoder().decode(ncUnb64(p))); } catch { return null; } }
app.get('/api/auth/tenant/start', ncGoogleStart);
app.get('/api/auth/tenant/callback/google', ncGoogleCallback);
app.get('/api/auth/tenant/consume', ncConsumeHandoff);
app.get('/api/auth/tenant/session', c => { const claims = ncDecodeJwt(ncCookie(c.req.raw, '__Host-mecopay_jwt')); if (!claims || claims.exp <= Math.floor(Date.now() / 1000) || claims.surface !== 'no-code' || claims.domain !== ncHost(c.req.raw)) return ncJson(c, null, 200); return ncJson(c, { session: { id: claims.jti, expiresAt: new Date(claims.exp * 1000).toISOString() }, user: { id: claims.sub, name: claims.name || 'MecoPay User', email: claims.email || '', emailVerified: true, image: claims.image || null } }); });
app.post('/api/auth/tenant/sign-out', ncSignOut);
app.post('/api/auth/tenant/email/start', ncEmailStart);
app.post('/api/auth/tenant/email/verify', ncEmailVerify);
app.post('/api/auth/tenant/telegram/request-link', ncTelegramRequest);
app.post('/api/auth/tenant/telegram/verify', ncTelegramVerify);
