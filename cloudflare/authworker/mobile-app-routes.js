// Mobile app auth bridge. The app's native login UI stays in the Android app.
// The web frontend only routes /app-login to /api/auth/mobile/start.
const MOBILE_CODE_TTL = 90;
const MOBILE_APP_TOKEN_TTL = 60 * 60 * 24 * 30;
const MOBILE_STATE_COOKIE = '__Host-mecopay_mobile_state';

function mobileNoStore(c, payload, status = 200) {
  const response = ncJson(c, payload, status);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  return response;
}
function mobileCookieState(request) {
  return ncCookie(request, MOBILE_STATE_COOKIE) || '';
}
function mobileClearStateCookie(response) {
  response.headers.append('Set-Cookie', `${MOBILE_STATE_COOKIE}=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax`);
  return response;
}
function mobileRedirect(location, state) {
  return new Response(null, { status: 302, headers: {
    Location: location,
    'Cache-Control': 'no-store, max-age=0',
    'Referrer-Policy': 'no-referrer',
    'Set-Cookie': `${MOBILE_STATE_COOKIE}=${state}; Max-Age=${NC_TTL}; Path=/; Secure; HttpOnly; SameSite=Lax`
  }});
}
function mobileDeepLink(code, app = null) {
  const scheme = app === 'sms_sender' ? 'mecopaysender' : 'mecopay';
  return `${scheme}://auth?code=${encodeURIComponent(code)}`;
}
async function mobileVerifyJwt(token, env) {
  if (typeof token !== 'string' || token.length > 8192 || !env.JWT_PRIVATE_KEY) throw new Error('INVALID_TOKEN');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('INVALID_TOKEN');
  const header = JSON.parse(new TextDecoder().decode(ncUnb64(parts[0])));
  if (header.alg !== 'ES256') throw new Error('INVALID_TOKEN_ALGORITHM');
  const privateKey = await crypto.subtle.importKey('pkcs8', decodePkcs8Pem(env.JWT_PRIVATE_KEY), { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']);
  const jwk = await crypto.subtle.exportKey('jwk', privateKey);
  const publicKey = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, ext: true, key_ops: ['verify'] }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, publicKey, ncUnb64(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if (!valid) throw new Error('INVALID_TOKEN_SIGNATURE');
  const claims = JSON.parse(new TextDecoder().decode(ncUnb64(parts[1])));
  if (!claims || typeof claims.exp !== 'number' || claims.exp <= Math.floor(Date.now() / 1000)) throw new Error('TOKEN_EXPIRED');
  return claims;
}
async function mobileCreateHandoff(env, state, motherToken, expectedProvider) {
  const storage = createOtpSecondaryStorage(env.OTP_STORE);
  const raw = await storage.get(`mobile:flow:${state}`);
  let flow; try { flow = raw ? JSON.parse(raw) : null; } catch { flow = null; }
  if (!flow || flow.expiresAt <= Date.now() || flow.provider !== expectedProvider) throw new Error('MOBILE_FLOW_EXPIRED');
  const motherClaims = await mobileVerifyJwt(motherToken, env);
  if (motherClaims.iss !== env.BETTER_AUTH_URL || motherClaims.surface !== 'mother' || motherClaims.domain !== 'mecopay.space' || motherClaims.aud !== 'mother-dashboard' || typeof motherClaims.sub !== 'string' || !motherClaims.sub.startsWith(`${expectedProvider}:`)) throw new Error('MOTHER_LOGIN_REQUIRED');
  const consumed = await storage.getAndDelete(`mobile:flow:${state}`);
  if (!consumed || consumed !== raw) throw new Error('MOBILE_FLOW_ALREADY_USED');
  const now = Math.floor(Date.now() / 1000);
  const appToken = await signAuthJwt(env.JWT_PRIVATE_KEY, {
    iss: env.BETTER_AUTH_URL,
    sub: motherClaims.sub,
    aud: 'mecopay-mobile',
    surface: 'mother',
    role: 'customer',
    domain: 'mecopay.space',
    mode: flow.mode,
    iat: now,
    exp: now + MOBILE_APP_TOKEN_TTL,
    jti: crypto.randomUUID(),
    email: motherClaims.email || null,
    name: motherClaims.name || 'MecoPay User',
    image: motherClaims.image || null,
    app: flow.app || null
  });
  const code = ncRandom();
  await storage.set(`mobile:code:${await ncHash(code)}`, JSON.stringify({ token: appToken, mode: flow.mode, expiresIn: MOBILE_APP_TOKEN_TTL, expiresAt: Date.now() + MOBILE_CODE_TTL * 1000 }), MOBILE_CODE_TTL);
  return { code, mode: flow.mode, app: flow.app || null };
}
async function mobileStart(c) {
  const url = new URL(c.req.url);
  if (url.protocol !== 'https:' || !['mecopay.space', 'www.mecopay.space'].includes(url.hostname.toLowerCase())) return mobileNoStore(c, { error: 'MOTHER_ORIGIN_REQUIRED' }, 403);
  if (url.hostname.toLowerCase() === 'www.mecopay.space') {
    url.hostname = 'mecopay.space';
    return new Response(null, { status: 302, headers: { Location: url.href, 'Cache-Control': 'no-store' } });
  }
  const requestedApp = c.req.query('app');
  const app = requestedApp === 'sms_sender' ? 'sms_sender' : null;
  const mode = c.req.query('mode') || (app === 'sms_sender' ? 'personal' : '');
  const provider = c.req.query('provider');
  if (!['merchant', 'personal'].includes(mode)) return mobileNoStore(c, { error: 'INVALID_MODE' }, 400);
  if (!['google', 'email', 'telegram'].includes(provider)) return mobileNoStore(c, { error: 'INVALID_PROVIDER' }, 400);
  if (!c.env.OTP_STORE || !c.env.JWT_PRIVATE_KEY) return mobileNoStore(c, { error: 'MOBILE_AUTH_NOT_CONFIGURED' }, 503);
  const state = ncRandom();
  const storage = createOtpSecondaryStorage(c.env.OTP_STORE);
  await storage.set(`mobile:flow:${state}`, JSON.stringify({ mode, provider, app, createdAt: Date.now(), expiresAt: Date.now() + NC_TTL * 1000 }), NC_TTL);
  let destination;
  if (provider === 'google') {
    const returnTo = `/api/auth/mobile/callback?state=${encodeURIComponent(state)}`;
    const google = new URL('/api/auth/google/start', url.origin);
    google.searchParams.set('returnTo', returnTo);
    destination = google.href;
  } else {
    const loginPath = provider === 'email' ? '/email-login' : '/telegram-login';
    const page = new URL(loginPath, url.origin);
    page.searchParams.set('mobileState', state);
    destination = page.href;
  }
  return mobileRedirect(destination, state);
}
async function mobileGoogleCallback(c) {
  const state = c.req.query('state') || '';
  if (!state || mobileCookieState(c.req.raw) !== state) return mobileNoStore(c, { error: 'MOBILE_FLOW_MISMATCH' }, 403);
  const raw = await createOtpSecondaryStorage(c.env.OTP_STORE).get(`mobile:flow:${state}`);
  let flow; try { flow = raw ? JSON.parse(raw) : null; } catch { flow = null; }
  if (!flow || flow.provider !== 'google' || flow.expiresAt <= Date.now()) return mobileNoStore(c, { error: 'MOBILE_FLOW_EXPIRED' }, 410);
  try {
    const handoff = await mobileCreateHandoff(c.env, state, ncCookie(c.req.raw, '__Host-mecopay_jwt'), 'google');
    const response = new Response(null, { status: 302, headers: { Location: mobileDeepLink(handoff.code, handoff.app), 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
    mobileClearStateCookie(response);
    return response;
  } catch (error) {
    console.error('[mobile-google-callback]', error instanceof Error ? error.message : 'unknown');
    return mobileNoStore(c, { error: 'MOBILE_LOGIN_FAILED' }, 401);
  }
}
async function mobileEmailVerify(c) {
  const host = new URL(c.req.url).hostname.toLowerCase();
  if (!['mecopay.space', 'www.mecopay.space'].includes(host)) return mobileNoStore(c, { error: 'MOTHER_ORIGIN_REQUIRED' }, 403);
  const body = await c.req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const otp = typeof body.otp === 'string' ? body.otp.trim() : '';
  const state = typeof body.mobileState === 'string' ? body.mobileState : '';
  if (!email || !otp || !state || mobileCookieState(c.req.raw) !== state) return mobileNoStore(c, { error: 'INVALID_MOBILE_OTP_REQUEST' }, 400);
  const storage = createOtpSecondaryStorage(c.env.OTP_STORE);
  const rawFlow = await storage.get(`mobile:flow:${state}`);
  let flow; try { flow = rawFlow ? JSON.parse(rawFlow) : null; } catch { flow = null; }
  if (!flow || flow.provider !== 'email' || flow.expiresAt <= Date.now()) return mobileNoStore(c, { error: 'MOBILE_FLOW_EXPIRED' }, 410);
  const rawOtp = await storage.get(`mother:email:${email}`);
  let otpFlow; try { otpFlow = rawOtp ? JSON.parse(rawOtp) : null; } catch { otpFlow = null; }
  if (!otpFlow || otpFlow.expiresAt <= Date.now() || await ncHash(`mother-email:${email}:${otp}`) !== otpFlow.otpHash) return mobileNoStore(c, { error: 'INVALID_OR_EXPIRED_OTP' }, 401);
  if (!await storage.getAndDelete(`mother:email:${email}`)) return mobileNoStore(c, { error: 'OTP_ALREADY_USED' }, 410);
  try {
    const login = await ncEnqueue(c.env, { surface: 'mother', provider: 'email', providerAccountId: email, email, emailVerified: true, name: email.split('@')[0], domain: 'mecopay.space', origin: new URL(c.req.url).origin, returnTo: '/login' });
    const handoff = await mobileCreateHandoff(c.env, state, login.token, 'email');
    const response = mobileNoStore(c, { status: 'verified', deepLink: mobileDeepLink(handoff.code, handoff.app), mode: handoff.mode, app: handoff.app });
    mobileClearStateCookie(response);
    return response;
  } catch (error) {
    console.error('[mobile-email-verify]', error instanceof Error ? error.message : 'unknown');
    return mobileNoStore(c, { error: 'MOBILE_LOGIN_FAILED' }, 503);
  }
}
async function mobileTelegramVerify(c) {
  const state = c.req.query('state') || '';
  if (!state || mobileCookieState(c.req.raw) !== state) return mobileNoStore(c, { error: 'MOBILE_FLOW_MISMATCH' }, 403);
  const rawFlow = await createOtpSecondaryStorage(c.env.OTP_STORE).get(`mobile:flow:${state}`);
  let flow; try { flow = rawFlow ? JSON.parse(rawFlow) : null; } catch { flow = null; }
  if (!flow || flow.provider !== 'telegram' || flow.expiresAt <= Date.now()) return mobileNoStore(c, { error: 'MOBILE_FLOW_EXPIRED' }, 410);
  const response = await tgLoginVerify(c);
  const result = await response.clone().json().catch(() => null);
  if (response.ok && result?.status === 'verified' && typeof result.token === 'string') {
    try {
      const handoff = await mobileCreateHandoff(c.env, state, result.token, 'telegram');
      const clean = mobileNoStore(c, { status: 'verified', deepLink: mobileDeepLink(handoff.code, handoff.app), mode: handoff.mode, app: handoff.app });
      mobileClearStateCookie(clean);
      return clean;
    } catch (error) {
      console.error('[mobile-telegram-verify]', error instanceof Error ? error.message : 'unknown');
      return mobileNoStore(c, { error: 'MOBILE_LOGIN_FAILED' }, 503);
    }
  }
  return response;
}
async function mobileExchange(c) {
  const body = await c.req.json().catch(() => ({}));
  const code = typeof body.code === 'string' ? body.code : '';
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(code)) return mobileNoStore(c, { error: 'INVALID_CODE' }, 400);
  const storage = createOtpSecondaryStorage(c.env.OTP_STORE);
  const raw = await storage.getAndDelete(`mobile:code:${await ncHash(code)}`);
  let record; try { record = raw ? JSON.parse(raw) : null; } catch { record = null; }
  if (!record || record.expiresAt <= Date.now()) return mobileNoStore(c, { error: 'CODE_EXPIRED_OR_USED' }, 410);
  return mobileNoStore(c, { token: record.token, token_type: 'Bearer', expires_in: record.expiresIn, mode: record.mode });
}
async function mobileSenderContext(c) {
  const authorization = c.req.header('Authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) return { response: mobileNoStore(c, { error: 'UNAUTHORIZED' }, 401) };
  let claims;
  try { claims = await mobileVerifyJwt(match[1], c.env); } catch { return { response: mobileNoStore(c, { error: 'UNAUTHORIZED' }, 401) }; }
  if (claims.iss !== c.env.BETTER_AUTH_URL || claims.aud !== 'mecopay-mobile' || claims.surface !== 'mother' || claims.domain !== 'mecopay.space' || claims.mode !== 'personal') {
    return { response: mobileNoStore(c, { error: 'PERSONAL_MODE_REQUIRED' }, 403) };
  }
  const identity = typeof claims.sub === 'string' ? /^([a-z]+):(.+)$/.exec(claims.sub) : null;
  if (!identity || !['google', 'email', 'telegram'].includes(identity[1])) return { response: mobileNoStore(c, { error: 'INVALID_IDENTITY' }, 401) };
  const sql = getSql(c.env);
  try {
    const users = await sql`
      SELECT u.id AS user_id,
        (
          lower(coalesce(to_jsonb(u)->>'banned', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(u)->>'blocked', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(u)->>'is_blocked', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(p)->>'banned', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(p)->>'blocked', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(p)->>'is_blocked', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(p)->>'account_status', to_jsonb(p)->>'status', '')) IN ('blocked', 'suspended', 'banned')
        ) AS blocked
      FROM mecopay_auth.account a
      JOIN mecopay_auth."user" u ON u.id = a."userId"
      LEFT JOIN mecopay_heart.profiles p ON p.id = u.id
      WHERE a."providerId" = ${identity[1]}
        AND a."accountId" = ${identity[2]}
        AND a.login_scope = 'mother'
        AND u.login_scope = 'mother'
      LIMIT 1
    `;
    if (!users.length) {
      await sql.end({ timeout: 2 }).catch(() => {});
      return { response: mobileNoStore(c, { error: 'ACCOUNT_SYNC_PENDING', retryable: true }, 503) };
    }
    if (users[0].blocked === true) {
      await sql.end({ timeout: 2 }).catch(() => {});
      return { response: mobileNoStore(c, { error: 'USER_BLOCKED' }, 403) };
    }
    const userId = String(users[0].user_id || '');
    if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      await sql.end({ timeout: 2 }).catch(() => {});
      return { response: mobileNoStore(c, { error: 'ACCOUNT_SYNC_PENDING', retryable: true }, 503) };
    }
    const profiles = await sql`SELECT id FROM mecopay_heart.profiles WHERE id = ${userId} LIMIT 1`;
    if (!profiles.length) {
      await sql.end({ timeout: 2 }).catch(() => {});
      return { response: mobileNoStore(c, { error: 'ACCOUNT_SYNC_PENDING', retryable: true }, 503) };
    }
    return { sql, userId };
  } catch (error) {
    console.error('[mobile-sender-auth]', error instanceof Error ? error.message : 'database query failed');
    await sql.end({ timeout: 2 }).catch(() => {});
    return { response: mobileNoStore(c, { error: 'AUTH_CONTEXT_FAILED', retryable: true }, 503) };
  }
}

async function mobileSenderBrands(c) {
  const context = await mobileSenderContext(c);
  if (context.response) return context.response;
  const sql = context.sql;
  try {
    const rows = await sql`
      SELECT ${context.userId}::text AS client_id,
        b.id::text AS brand_id,
        b.name AS brand_name,
        COALESCE(gw.fallback_to_sms, false) AS sms_enabled,
        st.sms_country_code,
        st.sim_slot,
        (st.id IS NOT NULL AND NULLIF(BTRIM(st.fcm_token), '') IS NOT NULL) AS is_connected
      FROM mecopay_heart.brands b
      LEFT JOIN mecopay_heart.whatsapp_gateway_settings gw
        ON gw.brand_id = b.id AND gw.user_id = b.user_id
      LEFT JOIN mecopay_heart.sms_sender_tokens st
        ON st.brand_id = b.id AND st.user_id = b.user_id
      WHERE b.user_id = ${context.userId}
      ORDER BY b.created_at ASC, b.id ASC
    `;
    return mobileNoStore(c, { client_id: context.userId, brands: rows });
  } catch (error) {
    console.error('[mobile-sender-brands]', error instanceof Error ? error.message : 'database query failed');
    return mobileNoStore(c, { error: 'SENDER_BRANDS_FETCH_FAILED', retryable: true }, 503);
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
}

async function mobileSenderRegister(c) {
  const context = await mobileSenderContext(c);
  if (context.response) return context.response;
  const sql = context.sql;
  try {
    const body = await c.req.json().catch(() => ({}));
    const brandId = typeof body.brand_id === 'string' ? body.brand_id.trim() : '';
    const fcmToken = typeof body.fcm_token === 'string' ? body.fcm_token.trim() : '';
    const smsCountryCode = typeof body.sms_country_code === 'string' ? body.sms_country_code.trim() : '';
    const simSlot = Number(body.sim_slot);
    if (!brandId || brandId.length > 128) return mobileNoStore(c, { error: 'INVALID_BRAND_ID' }, 400);
    if (!fcmToken || fcmToken.length > 4096) return mobileNoStore(c, { error: 'INVALID_FCM_TOKEN' }, 400);
    if (!/^\+[1-9][0-9]{0,3}$/.test(smsCountryCode)) return mobileNoStore(c, { error: 'INVALID_SMS_COUNTRY_CODE' }, 400);
    if (!Number.isInteger(simSlot) || ![1, 2].includes(simSlot)) return mobileNoStore(c, { error: 'INVALID_SIM_SLOT' }, 400);
    const owned = await sql`
      SELECT id::text AS brand_id
      FROM mecopay_heart.brands
      WHERE id::text = ${brandId} AND user_id = ${context.userId}
      LIMIT 1
    `;
    if (!owned.length) return mobileNoStore(c, { error: 'BRAND_NOT_FOUND' }, 404);
    const deviceSecret = ncRandom();
    const rowId = crypto.randomUUID();
    const saved = await sql`
      INSERT INTO mecopay_heart.sms_sender_tokens
        (id, user_id, brand_id, fcm_token, sms_country_code, sim_slot, device_secret, created_at, updated_at)
      VALUES
        (${rowId}, ${context.userId}, ${brandId}, ${fcmToken}, ${smsCountryCode}, ${simSlot}, ${deviceSecret}, NOW(), NOW())
      ON CONFLICT (brand_id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        fcm_token = EXCLUDED.fcm_token,
        sms_country_code = EXCLUDED.sms_country_code,
        sim_slot = EXCLUDED.sim_slot,
        device_secret = EXCLUDED.device_secret,
        updated_at = NOW()
      RETURNING brand_id::text AS brand_id
    `;
    if (!saved.length) return mobileNoStore(c, { error: 'SENDER_REGISTER_FAILED', retryable: true }, 503);
    return mobileNoStore(c, { ok: true, brand_id: saved[0].brand_id, device_secret: deviceSecret, sim_slot: simSlot, sms_country_code: smsCountryCode });
  } catch (error) {
    console.error('[mobile-sender-register]', error instanceof Error ? error.message : 'database query failed');
    return mobileNoStore(c, { error: 'SENDER_REGISTER_FAILED', retryable: true }, 503);
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
}

async function mobileSenderTokenRefresh(c) {
  const body = await c.req.json().catch(() => ({}));
  const brandId = typeof body.brand_id === 'string' ? body.brand_id.trim() : '';
  const deviceSecret = typeof body.device_secret === 'string' ? body.device_secret.trim() : '';
  const fcmToken = typeof body.fcm_token === 'string' ? body.fcm_token.trim() : '';
  if (!brandId || brandId.length > 128 || !deviceSecret || deviceSecret.length > 4096 || !fcmToken || fcmToken.length > 4096) {
    return mobileNoStore(c, { error: 'INVALID_SENDER_REFRESH_REQUEST' }, 400);
  }
  const sql = getSql(c.env);
  try {
    const updated = await sql`
      UPDATE mecopay_heart.sms_sender_tokens
      SET fcm_token = ${fcmToken}, updated_at = NOW()
      WHERE brand_id::text = ${brandId} AND device_secret = ${deviceSecret}
      RETURNING brand_id::text AS brand_id
    `;
    if (!updated.length) return mobileNoStore(c, { error: 'SENDER_NOT_AUTHORIZED' }, 401);
    return mobileNoStore(c, { ok: true, brand_id: updated[0].brand_id });
  } catch (error) {
    console.error('[mobile-sender-token-refresh]', error instanceof Error ? error.message : 'database query failed');
    return mobileNoStore(c, { error: 'SENDER_REFRESH_FAILED', retryable: true }, 503);
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
}

async function mobileSenderAck(c) {
  const body = await c.req.json().catch(() => ({}));
  const brandId = typeof body.brand_id === 'string' ? body.brand_id.trim() : '';
  const deviceSecret = typeof body.device_secret === 'string' ? body.device_secret.trim() : '';
  const smsId = typeof body.sms_id === 'string' ? body.sms_id.trim() : '';
  const status = body.status === 'sent' || body.status === 'failed' ? body.status : '';
  const errorText = body.error == null ? null : (typeof body.error === 'string' ? body.error.slice(0, 2000) : '');
  if (!brandId || brandId.length > 128 || !deviceSecret || deviceSecret.length > 4096 || !smsId || smsId.length > 256 || !status || (body.error != null && !errorText)) {
    return mobileNoStore(c, { error: 'INVALID_SENDER_ACK_REQUEST' }, 400);
  }
  const sql = getSql(c.env);
  try {
    const sender = await sql`
      SELECT brand_id::text AS brand_id
      FROM mecopay_heart.sms_sender_tokens
      WHERE brand_id::text = ${brandId} AND device_secret = ${deviceSecret}
      LIMIT 1
    `;
    if (!sender.length) return mobileNoStore(c, { error: 'SENDER_NOT_AUTHORIZED' }, 401);
    const updated = await sql`
      UPDATE mecopay_heart.notification_logs
      SET status = ${status},
          payload = COALESCE(payload, '{}'::jsonb) || jsonb_build_object('ack_error', ${errorText}, 'acknowledged_at', NOW())
      WHERE brand_id::text = ${brandId} AND sms_id::text = ${smsId}
      RETURNING sms_id::text AS sms_id
    `;
    if (!updated.length) return mobileNoStore(c, { error: 'SMS_LOG_NOT_FOUND' }, 404);
    return mobileNoStore(c, { ok: true, sms_id: updated[0].sms_id, status });
  } catch (error) {
    console.error('[mobile-sender-ack]', error instanceof Error ? error.message : 'database query failed');
    return mobileNoStore(c, { error: 'SENDER_ACK_FAILED', retryable: true }, 503);
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
}

async function mobileConfig(c) {
  const authorization = c.req.header('Authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) return mobileNoStore(c, { error: 'UNAUTHORIZED' }, 401);
  let claims;
  try { claims = await mobileVerifyJwt(match[1], c.env); } catch { return mobileNoStore(c, { error: 'UNAUTHORIZED' }, 401); }
  if (claims.iss !== c.env.BETTER_AUTH_URL || claims.aud !== 'mecopay-mobile' || claims.surface !== 'mother' || claims.domain !== 'mecopay.space' || claims.mode !== 'personal') return mobileNoStore(c, { error: 'PERSONAL_MODE_REQUIRED' }, 403);
  const identity = typeof claims.sub === 'string' ? /^([a-z]+):(.+)$/.exec(claims.sub) : null;
  if (!identity || !['google', 'email', 'telegram'].includes(identity[1])) return mobileNoStore(c, { error: 'INVALID_IDENTITY' }, 401);
  const sql = getSql(c.env);
  try {
    const users = await sql`
      SELECT u.id AS user_id,
        (
          lower(coalesce(to_jsonb(u)->>'banned', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(u)->>'blocked', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(u)->>'is_blocked', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(p)->>'banned', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(p)->>'blocked', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(p)->>'is_blocked', '')) IN ('true', '1', 'yes') OR
          lower(coalesce(to_jsonb(p)->>'account_status', to_jsonb(p)->>'status', '')) IN ('blocked', 'suspended', 'banned')
        ) AS blocked
      FROM mecopay_auth.account a
      JOIN mecopay_auth."user" u ON u.id = a."userId"
      LEFT JOIN mecopay_heart.profiles p ON p.id = u.id
      WHERE a."providerId" = ${identity[1]}
        AND a."accountId" = ${identity[2]}
        AND a.login_scope = 'mother'
        AND u.login_scope = 'mother'
      LIMIT 1
    `;
    if (!users.length) return mobileNoStore(c, { error: 'ACCOUNT_SYNC_PENDING', retryable: true }, 503);
    if (users[0].blocked === true) return mobileNoStore(c, { error: 'USER_BLOCKED' }, 403);
    const userId = users[0].user_id;
    if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(userId))) {
      return mobileNoStore(c, { error: 'ACCOUNT_SYNC_PENDING', retryable: true }, 503);
    }
    const profiles = await sql`SELECT id FROM mecopay_heart.profiles WHERE id = ${userId} LIMIT 1`;
    if (!profiles.length) return mobileNoStore(c, { error: 'ACCOUNT_SYNC_PENDING', retryable: true }, 503);
    const deviceName = c.req.query('device_name');
    const rows = await sql`
      SELECT s.user_id::text AS user_id, s.brand_id, s.device_name, s.webhook_url,
             s.headers, s.hmac_secret, s.sender_number, s.text_filter,
             s.json_payload_template, s.heartbeat_ws_url, s.dashboard_url
      FROM mecopay_heart.sms_forwarder_settings s
      JOIN mecopay_heart.brands b
        ON b.id::text = s.brand_id AND b.user_id = s.user_id::text
      JOIN mecopay_heart.device_status d
        ON d.user_id = s.user_id::text AND d.device_id = s.device_name
      WHERE s.user_id::text = ${String(userId)}
        AND s.device_name NOT LIKE '__GLOBAL_CONFIG_%'
        AND s.is_active = true
        AND (${deviceName || null}::text IS NULL OR s.device_name = ${deviceName || null})
      ORDER BY s.updated_at DESC
      LIMIT 1
    `;
    if (!rows.length) return mobileNoStore(c, { error: 'CONFIGURE_WEBSITE_FIRST', configured: false }, 404);
    return mobileNoStore(c, { ...rows[0], mode: 'personal', configured: true });
  } catch (error) {
    console.error('[mobile-config]', error instanceof Error ? error.message : 'database query failed');
    return mobileNoStore(c, { error: 'CONFIG_FETCH_FAILED', retryable: true }, 503);
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
}

app.get('/api/auth/mobile/start', mobileStart);
app.get('/api/auth/mobile/callback', mobileGoogleCallback);
app.post('/api/auth/mobile/email/verify', mobileEmailVerify);
app.post('/api/auth/mobile/telegram/verify', mobileTelegramVerify);
app.post('/api/auth/mobile/exchange', mobileExchange);
app.get('/api/auth/mobile/config', mobileConfig);
app.get('/api/auth/mobile/sender-brands', mobileSenderBrands);
app.post('/api/auth/mobile/sender-register', mobileSenderRegister);
app.post('/api/auth/mobile/sender-token-refresh', mobileSenderTokenRefresh);
app.post('/api/auth/mobile/sender-ack', mobileSenderAck);
