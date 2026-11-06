// Telegram login routes for the existing MecoPay Auth Worker.
// This fragment is inserted into the current authworker bundle before its
// /api/auth/* catch-all. It intentionally reuses OTP_STORE and the existing
// Better Auth + session-token route; it does not introduce a second auth model.
const TG_LOGIN_TTL_SECONDS = 5 * 60;
const TG_LOGIN_MAX_REQUESTS = 2;
const TG_LOGIN_IP_MAX_REQUESTS = 10;
const TG_LOGIN_COOKIE = '__Host-mecopay_tg_flow';
const tgLoginEncoder = new TextEncoder();

function tgLoginBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function tgLoginRandomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return tgLoginBase64Url(bytes);
}

async function tgLoginHash(value) {
  const digest = await crypto.subtle.digest('SHA-256', tgLoginEncoder.encode(value));
  return tgLoginBase64Url(new Uint8Array(digest));
}

async function tgLoginHmac(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw',
    tgLoginEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, tgLoginEncoder.encode(value));
  return tgLoginBase64Url(new Uint8Array(signature));
}

function tgLoginSafeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function tgLoginReadCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    return part.slice(separator + 1).trim();
  }
  return null;
}

async function tgLoginReadSession(request, env) {
  const raw = tgLoginReadCookie(request, TG_LOGIN_COOKIE);
  if (!raw || !env.BETTER_AUTH_SECRET) return null;
  const separator = raw.lastIndexOf('.');
  if (separator < 1) return null;
  const sessionId = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  const expected = await tgLoginHmac(env.BETTER_AUTH_SECRET, `telegram-login-session:v1:${sessionId}`);
  return tgLoginSafeEqual(signature, expected) ? sessionId : null;
}

async function tgLoginCreateSession(request, env) {
  let sessionId = await tgLoginReadSession(request, env);
  if (sessionId) return { sessionId, setCookie: null };
  sessionId = crypto.randomUUID();
  const signature = await tgLoginHmac(env.BETTER_AUTH_SECRET, `telegram-login-session:v1:${sessionId}`);
  const value = `${sessionId}.${signature}`;
  return {
    sessionId,
    setCookie: `${TG_LOGIN_COOKIE}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${TG_LOGIN_TTL_SECONDS}`,
  };
}

function tgLoginNoStore(context, payload, status = 200) {
  const response = context.json(payload, status);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

function tgLoginSetCookies(response, cookies) {
  for (const cookie of cookies) {
    if (typeof cookie === 'string' && cookie) response.headers.append('Set-Cookie', cookie);
  }
  return response;
}

function tgLoginExtractSetCookies(response) {
  if (typeof response.headers.getSetCookie === 'function') return response.headers.getSetCookie();
  const cookie = response.headers.get('Set-Cookie');
  return cookie ? [cookie] : [];
}

function tgLoginCookiePairs(cookies) {
  return cookies
    .map((cookie) => cookie.split(';', 1)[0])
    .filter(Boolean)
    .join('; ');
}

function tgLoginAllowedOrigin(context) {
  const url = new URL(context.req.url);
  const hostAllowed = url.hostname === 'mecopay.space' || url.hostname === 'www.mecopay.space';
  const origin = context.req.header('Origin');
  return url.protocol === 'https:' && hostAllowed && (!origin || origin === url.origin);
}

async function tgLoginTelegramApi(env, method, payload) {
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_NOT_CONFIGURED');
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) throw new Error('TELEGRAM_API_REQUEST_FAILED');
  return result.result;
}

async function tgLoginReplyToTelegram(env, chatId, text) {
  try {
    await tgLoginTelegramApi(env, 'sendMessage', { chat_id: chatId, text });
  } catch {
    console.warn('[telegram-login] Telegram confirmation message could not be sent');
  }
}

function tgLoginChallengeKey(challengeId) {
  return `telegram-login:challenge:${challengeId}`;
}

function tgLoginStartKey(startHash) {
  return `telegram-login:start:${startHash}`;
}

function tgLoginActiveKey(sessionId) {
  return `telegram-login:active:${sessionId}`;
}

function tgLoginParseChallenge(value) {
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

async function tgLoginRequestLink(context) {
  if (!tgLoginAllowedOrigin(context)) return tgLoginNoStore(context, { error: 'ORIGIN_NOT_ALLOWED' }, 403);
  const env = context.env;
  if (!env.OTP_STORE || !env.BETTER_AUTH_SECRET || !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_BOT_USERNAME) {
    return tgLoginNoStore(context, { error: 'TELEGRAM_LOGIN_NOT_CONFIGURED' }, 503);
  }

  try {
    const flow = await tgLoginCreateSession(context.req.raw, env);
    const clientIp = context.req.header('CF-Connecting-IP');
    if (clientIp) {
      const ipHash = await tgLoginHash(`telegram-login-ip:v1:${clientIp}`);
      const ipRate = await consumeRateLimit(
        env.OTP_STORE,
        `telegram-login-ip:${ipHash}`,
        TG_LOGIN_IP_MAX_REQUESTS,
        TG_LOGIN_TTL_SECONDS
      );
      if (!ipRate.allowed) {
        const response = tgLoginNoStore(context, {
          error: 'TELEGRAM_LOGIN_IP_RATE_LIMITED',
          retryAfterSeconds: ipRate.retryAfterSeconds,
          message: 'Too many Telegram login requests from this network. Please wait five minutes.',
        }, 429);
        response.headers.set('Retry-After', String(ipRate.retryAfterSeconds));
        if (flow.setCookie) response.headers.append('Set-Cookie', flow.setCookie);
        return response;
      }
    }

    const rate = await consumeRateLimit(
      env.OTP_STORE,
      `telegram-login-links:${flow.sessionId}`,
      TG_LOGIN_MAX_REQUESTS,
      TG_LOGIN_TTL_SECONDS
    );
    if (!rate.allowed) {
      const response = tgLoginNoStore(context, {
        error: 'TELEGRAM_LOGIN_RATE_LIMITED',
        retryAfterSeconds: rate.retryAfterSeconds,
        message: 'You can request up to two Telegram login links in five minutes.',
      }, 429);
      response.headers.set('Retry-After', String(rate.retryAfterSeconds));
      if (flow.setCookie) response.headers.append('Set-Cookie', flow.setCookie);
      return response;
    }

    const username = String(env.TELEGRAM_BOT_USERNAME).replace(/^@/, '');
    if (!/^[A-Za-z0-9_]{5,32}$/.test(username)) {
      return tgLoginNoStore(context, { error: 'TELEGRAM_BOT_USERNAME_INVALID' }, 503);
    }

    const storage = createOtpSecondaryStorage(env.OTP_STORE);
    const activeKey = tgLoginActiveKey(flow.sessionId);
    const previous = tgLoginParseChallenge(await storage.get(activeKey));
    if (previous?.challengeId && previous?.startHash) {
      await storage.delete(tgLoginChallengeKey(previous.challengeId));
      await storage.delete(tgLoginStartKey(previous.startHash));
    }

    const now = Date.now();
    const challengeId = crypto.randomUUID();
    const startToken = tgLoginRandomToken();
    const startHash = await tgLoginHash(startToken);
    const challenge = {
      challengeId,
      sessionId: flow.sessionId,
      startHash,
      createdAt: now,
      expiresAt: now + TG_LOGIN_TTL_SECONDS * 1000,
      confirmed: false,
      telegramUserId: null,
      telegramName: null,
      telegramChatId: null,
    };
    await storage.set(tgLoginChallengeKey(challengeId), JSON.stringify(challenge), TG_LOGIN_TTL_SECONDS);
    await storage.set(tgLoginStartKey(startHash), challengeId, TG_LOGIN_TTL_SECONDS);
    await storage.set(activeKey, JSON.stringify({ challengeId, startHash }), TG_LOGIN_TTL_SECONDS);

    const response = tgLoginNoStore(context, {
      challengeId,
      loginUrl: `https://t.me/${username}?start=${startToken}`,
      expiresAt: challenge.expiresAt,
      remainingRequests: Math.max(0, TG_LOGIN_MAX_REQUESTS - rate.count),
      retryAfterSeconds: rate.retryAfterSeconds,
    });
    if (flow.setCookie) response.headers.append('Set-Cookie', flow.setCookie);
    return response;
  } catch (error) {
    console.error('[telegram-login] Link request failed', error instanceof Error ? error.message : 'unknown');
    return tgLoginNoStore(context, { error: 'TELEGRAM_LOGIN_REQUEST_FAILED' }, 503);
  }
}

async function tgLoginWebhook(context) {
  const env = context.env;
  if (!env.TELEGRAM_BOT_TOKEN || !env.BETTER_AUTH_SECRET || !env.OTP_STORE) {
    return tgLoginNoStore(context, { error: 'TELEGRAM_LOGIN_NOT_CONFIGURED' }, 503);
  }
  const suppliedSecret = context.req.header('X-Telegram-Bot-Api-Secret-Token') || '';
  const expectedSecret = await tgLoginHmac(env.TELEGRAM_BOT_TOKEN, 'mecopay-telegram-webhook:v1');
  if (!tgLoginSafeEqual(suppliedSecret, expectedSecret)) {
    return tgLoginNoStore(context, { error: 'WEBHOOK_UNAUTHORIZED' }, 403);
  }

  const update = await context.req.json().catch(() => null);
  const message = update?.message;
  if (
    !message
    || message.chat?.type !== 'private'
    || !Number.isSafeInteger(message.chat.id)
    || message.chat.id <= 0
    || !Number.isSafeInteger(message.from?.id)
    || message.from.id <= 0
    || typeof message.text !== 'string'
  ) {
    return tgLoginNoStore(context, { ok: true });
  }
  const match = message.text.trim().match(/^\/start(?:@[A-Za-z0-9_]+)?(?:\s+([A-Za-z0-9_-]{32,64}))?$/);
  if (!match) return tgLoginNoStore(context, { ok: true });
  const chatId = message.chat.id;
  const startToken = match[1];
  if (!startToken) {
    await tgLoginReplyToTelegram(env, chatId, 'To sign in, open Telegram from the MecoPay login page and tap Start.');
    return tgLoginNoStore(context, { ok: true });
  }

  try {
    const startHash = await tgLoginHash(startToken);
    const storage = createOtpSecondaryStorage(env.OTP_STORE);
    const challengeId = await storage.get(tgLoginStartKey(startHash));
    if (!challengeId) {
      await tgLoginReplyToTelegram(env, chatId, 'This MecoPay login link has expired or was already used. Request a new link in your browser.');
      return tgLoginNoStore(context, { ok: true });
    }

    const challengeKey = tgLoginChallengeKey(challengeId);
    const challenge = tgLoginParseChallenge(await storage.get(challengeKey));
    if (!challenge || challenge.expiresAt <= Date.now()) {
      await storage.delete(tgLoginStartKey(startHash));
      await tgLoginReplyToTelegram(env, chatId, 'This MecoPay login link has expired. Request a new link in your browser.');
      return tgLoginNoStore(context, { ok: true });
    }
    if (challenge.confirmed) {
      await tgLoginReplyToTelegram(env, chatId, 'Telegram is already confirmed. Return to your browser and click Verify.');
      return tgLoginNoStore(context, { ok: true });
    }

    const telegramUserId = String(message.from.id);
    const userRate = await consumeRateLimit(
      env.OTP_STORE,
      `telegram-login-user:${telegramUserId}`,
      TG_LOGIN_MAX_REQUESTS,
      TG_LOGIN_TTL_SECONDS
    );
    if (!userRate.allowed) {
      await tgLoginReplyToTelegram(env, chatId, 'Too many MecoPay login requests. Please wait five minutes before trying again.');
      return tgLoginNoStore(context, { ok: true });
    }

    const claimedChallengeId = await storage.getAndDelete(tgLoginStartKey(startHash));
    if (claimedChallengeId !== challengeId) return tgLoginNoStore(context, { ok: true });
    const remainingSeconds = Math.max(1, Math.ceil((challenge.expiresAt - Date.now()) / 1000));
    const updated = {
      ...challenge,
      confirmed: true,
      telegramUserId,
      telegramChatId: String(chatId),
      telegramName: [message.from.first_name, message.from.last_name].filter(Boolean).join(' ').slice(0, 120)
        || (typeof message.from.username === 'string' ? message.from.username.slice(0, 120) : `Telegram user ${telegramUserId}`),
      confirmedAt: Date.now(),
    };
    await storage.set(challengeKey, JSON.stringify(updated), remainingSeconds);
    await tgLoginReplyToTelegram(env, chatId, 'Telegram confirmed. Return to your browser and click “Verify and sign in”. This request expires in five minutes.');
    return tgLoginNoStore(context, { ok: true });
  } catch (error) {
    console.error('[telegram-login] Webhook processing failed', error instanceof Error ? error.message : 'unknown');
    return tgLoginNoStore(context, { error: 'WEBHOOK_PROCESSING_FAILED' }, 500);
  }
}

async function tgLoginPersistChatId(env, userId, telegramUserId, telegramChatId) {
  if (!telegramChatId || !/^\d+$/.test(telegramChatId)) {
    throw new Error('TELEGRAM_CHAT_ID_MISSING');
  }

  const sql = getSql(env);
  try {
    await sql.begin(async (tx) => {
      const existingTelegram = await tx`
        select "userId"
        from mecopay_auth.account
        where "providerId" = 'telegram' and "accountId" = ${telegramUserId}
        limit 1
        for update
      `;
      if (existingTelegram[0] && existingTelegram[0].userId !== userId) {
        throw new Error('TELEGRAM_ACCOUNT_USER_MISMATCH');
      }

      const existingForUser = await tx`
        select "accountId"
        from mecopay_auth.account
        where "providerId" = 'telegram' and "userId" = ${userId}
        limit 1
        for update
      `;
      if (existingForUser[0] && existingForUser[0].accountId !== telegramUserId) {
        throw new Error('USER_HAS_DIFFERENT_TELEGRAM_ACCOUNT');
      }

      if (!existingTelegram[0]) {
        await tx`
          insert into mecopay_auth.account
            (id, "accountId", "providerId", "userId", "telegramChatId")
          values
            (${crypto.randomUUID()}, ${telegramUserId}, 'telegram', ${userId}, ${telegramChatId})
          on conflict ("providerId", "accountId") do nothing
        `;
      }

      const confirmed = await tx`
        select "userId"
        from mecopay_auth.account
        where "providerId" = 'telegram' and "accountId" = ${telegramUserId}
        limit 1
      `;
      if (!confirmed[0] || confirmed[0].userId !== userId) {
        throw new Error('TELEGRAM_ACCOUNT_USER_MISMATCH');
      }

      // সফল Telegram verification-এর chat ID একই account row-তে স্থায়ীভাবে রাখুন।
      await tx`
        update mecopay_auth.account
        set "telegramChatId" = ${telegramChatId}, "updatedAt" = now()
        where "providerId" = 'telegram'
          and "accountId" = ${telegramUserId}
          and "userId" = ${userId}
      `;
    });
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
}

async function tgLoginIssueAuthSession(context, telegramUserId, telegramName, telegramChatId) {
  const env = context.env;
  const requestUrl = new URL(context.req.url);
  const email = `telegram-${telegramUserId}@users.invalid`;
  const password = `${await tgLoginHmac(env.BETTER_AUTH_SECRET, `mecopay-telegram-account:v1:${telegramUserId}`)}A1!`;
  const auth = createAuth(env, { skipLoginProvision: true });
  const commonHeaders = new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Origin: requestUrl.origin,
    ...(context.req.header('User-Agent') ? { 'User-Agent': context.req.header('User-Agent') } : {}),
  });

  const signupRequest = new Request(new URL('/api/auth/sign-up/email', requestUrl.origin), {
    method: 'POST',
    headers: new Headers(commonHeaders),
    body: JSON.stringify({ name: telegramName || `Telegram user ${telegramUserId}`, email, password }),
  });
  const signupResponse = await auth.handler(signupRequest);
  if (!signupResponse.ok && signupResponse.status !== 409 && signupResponse.status !== 422) {
    console.error('[telegram-login] Better Auth account creation failed', signupResponse.status);
    throw new Error('TELEGRAM_ACCOUNT_CREATION_FAILED');
  }

  const signinRequest = new Request(new URL('/api/auth/sign-in/email', requestUrl.origin), {
    method: 'POST',
    headers: new Headers(commonHeaders),
    body: JSON.stringify({ email, password, rememberMe: true }),
  });
  const signinResponse = await auth.handler(signinRequest);
  if (!signinResponse.ok) {
    console.error('[telegram-login] Better Auth session creation failed', signinResponse.status);
    throw new Error('TELEGRAM_SESSION_CREATION_FAILED');
  }
  const cookies = tgLoginExtractSetCookies(signinResponse);
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
  return responseWithSession;
}

async function tgLoginVerify(context) {
  if (!tgLoginAllowedOrigin(context)) return tgLoginNoStore(context, { error: 'ORIGIN_NOT_ALLOWED' }, 403);
  const env = context.env;
  const sessionId = await tgLoginReadSession(context.req.raw, env);
  if (!sessionId) return tgLoginNoStore(context, { error: 'LOGIN_FLOW_EXPIRED', message: 'Request a new Telegram login link.' }, 401);
  const body = await context.req.json().catch(() => null);
  const challengeId = typeof body?.challengeId === 'string' ? body.challengeId : '';
  if (!/^[0-9a-f-]{36}$/i.test(challengeId)) return tgLoginNoStore(context, { error: 'INVALID_CHALLENGE' }, 400);

  try {
    const storage = createOtpSecondaryStorage(env.OTP_STORE);
    const key = tgLoginChallengeKey(challengeId);
    const challenge = tgLoginParseChallenge(await storage.get(key));
    if (!challenge || challenge.expiresAt <= Date.now()) {
      return tgLoginNoStore(context, { status: 'expired', error: 'CHALLENGE_EXPIRED' }, 410);
    }
    if (challenge.sessionId !== sessionId) return tgLoginNoStore(context, { error: 'CHALLENGE_SESSION_MISMATCH' }, 403);
    if (!challenge.confirmed || !challenge.telegramUserId) {
      return tgLoginNoStore(context, { status: 'pending', message: 'Open Telegram, press Start, then verify here.' }, 200);
    }

    const consumed = tgLoginParseChallenge(await storage.getAndDelete(key));
    if (!consumed || consumed.sessionId !== sessionId || !consumed.confirmed || !consumed.telegramUserId) {
      return tgLoginNoStore(context, { status: 'expired', error: 'CHALLENGE_ALREADY_USED' }, 410);
    }
    const active = tgLoginParseChallenge(await storage.get(tgLoginActiveKey(sessionId)));
    if (active?.challengeId === challengeId) await storage.delete(tgLoginActiveKey(sessionId));

    return await tgLoginIssueAuthSession(
      context,
      consumed.telegramUserId,
      consumed.telegramName,
      consumed.telegramChatId
    );
  } catch (error) {
    console.error('[telegram-login] Verify failed', error instanceof Error ? error.message : 'unknown');
    return tgLoginNoStore(context, { error: 'TELEGRAM_LOGIN_VERIFY_FAILED', message: 'The sign-in could not be completed. Request another link and try again.' }, 503);
  }
}

app.post('/api/auth/telegram/request-link', tgLoginRequestLink);
app.post('/api/auth/telegram/verify', tgLoginVerify);
app.post('/api/auth/telegram/webhook', tgLoginWebhook);
