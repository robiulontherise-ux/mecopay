import { neon } from '@neondatabase/serverless';

interface Env {
  HYPERDRIVE: { connectionString: string };
  KYC_BUCKET: R2Bucket;
  JWT_PRIVATE_KEY: string;
  JWT_PUBLIC_KEY_PEM?: string;
  BETTER_AUTH_URL?: string;
  ALLOWED_ORIGIN?: string;
}

type Claims = Record<string, unknown> & { sub: string; exp: number; iat: number; iss?: string; aud?: string; jti?: string };
type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<any[]>;
const COOKIE = '__Host-mecopay_jwt';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_FIELDS = ['nid_front', 'nid_back', 'selfie', 'profile_image'] as const;
type ImageField = typeof IMAGE_FIELDS[number];

function json(body: unknown, status = 200, extra: HeadersInit = {}) {
  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra });
  return new Response(JSON.stringify(body), { status, headers });
}
function b64uBytes(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const raw = atob(padded);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
function b64u(value: ArrayBuffer | Uint8Array) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function pemBytes(pem: string) { return b64uBytes(pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')); }
async function verificationKey(env: Env) {
  if (env.JWT_PUBLIC_KEY_PEM) {
    return crypto.subtle.importKey('spki', pemBytes(env.JWT_PUBLIC_KEY_PEM), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  }
  const privateKey = await crypto.subtle.importKey('pkcs8', pemBytes(env.JWT_PRIVATE_KEY), { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']);
  const publicJwk = await crypto.subtle.exportKey('jwk', privateKey);
  delete (publicJwk as JsonWebKey).d;
  return crypto.subtle.importKey('jwk', publicJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
}
async function verifyJwt(token: string, env: Env): Promise<Claims> {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0].length > 2048 || parts[1].length > 8192 || parts[2].length > 2048) throw new Error('INVALID_TOKEN');
  const header = JSON.parse(new TextDecoder().decode(b64uBytes(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(b64uBytes(parts[1]))) as Claims;
  if (header.alg !== 'ES256' || !payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) throw new Error('INVALID_TOKEN');
  if (env.BETTER_AUTH_URL !== payload.iss) throw new Error('INVALID_TOKEN_ISSUER');
  if (payload.aud !== 'mother-dashboard') throw new Error('INVALID_TOKEN_AUDIENCE');
  if (payload.surface !== 'mother') throw new Error('INVALID_TOKEN_SURFACE');
  const key = await verificationKey(env);
  const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64uBytes(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if (!valid) throw new Error('INVALID_TOKEN');
  return payload;
}
async function signJwt(claims: Claims, env: Env) {
  const header = b64u(new TextEncoder().encode(JSON.stringify({ alg: 'ES256', typ: 'JWT' })));
  const body = b64u(new TextEncoder().encode(JSON.stringify(claims)));
  const key = await crypto.subtle.importKey('pkcs8', pemBytes(env.JWT_PRIVATE_KEY), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(`${header}.${body}`));
  return `${header}.${body}.${b64u(signature)}`;
}
function cookieToken(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim();
  return request.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) || '';
}
function cookieHeader(token: string, maxAge: number) { return `${COOKIE}=${token}; Max-Age=${maxAge}; Path=/; Secure; HttpOnly; SameSite=Lax`; }
function originHeaders(request: Request, env: Env) {
  const origin = request.headers.get('origin');
  const allowed = env.ALLOWED_ORIGIN || new URL(request.url).origin;
  const h: HeadersInit = { vary: 'Origin' };
  if (origin === allowed) { h['access-control-allow-origin'] = origin; h['access-control-allow-credentials'] = 'true'; }
  return h;
}
function text(form: FormData, name: string) { return String(form.get(name) || '').trim(); }
function image(form: FormData, name: ImageField) {
  const value = form.get(name);
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) return null;
  const file = value as File;
  return file.size > 0 ? file : null;
}
function safePart(value: string) { return value.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80); }
async function resolveIdentity(sql: Sql, claims: Claims) {
  const [provider, ...rest] = String(claims.sub).split(':');
  const accountId = rest.join(':');
  if (!provider || !accountId || !['email', 'google', 'telegram'].includes(provider)) throw new Error('IDENTITY_MAPPING_NOT_FOUND');
  const rows = await sql`select a."userId" as user_id, a."accountId" as account_id, u.email, u.name
    from mecopay_auth.account a left join mecopay_auth."user" u on u.id = a."userId"
    where a."providerId" = ${provider} and a."accountId" = ${accountId} limit 1`;
  if (!rows[0]?.user_id) throw new Error('IDENTITY_MAPPING_NOT_FOUND');
  return { userId: String(rows[0].user_id), email: rows[0].email || null, name: rows[0].name || null };
}
async function loadProfile(sql: Sql, clientId: string) {
  const rows = await sql`select id, name, email, phone, phone_type, verification_status, rejection_reason,
    nid_number, nid_front_key, nid_back_key, selfie_key, profile_image_key, website_url, social_fb, social_insta, social_li, social_yt
    from mecopay_heart.profiles where id = ${clientId} limit 1`;
  return rows[0] || null;
}
async function saveProfile(request: Request, env: Env, claims: Claims) {
  const sql = neon(env.HYPERDRIVE.connectionString) as unknown as Sql;
  const identity = await resolveIdentity(sql, claims);
  const existing = await loadProfile(sql, identity.userId);
  const form = await request.formData();
  const name = text(form, 'name');
  const phone = text(form, 'phone');
  const phoneType = text(form, 'phone_type');
  const nidNumber = text(form, 'nid_number');
  const websiteUrl = text(form, 'website_url') || null;
  const socialFb = text(form, 'social_fb') || null;
  const socialInsta = text(form, 'social_insta') || null;
  const socialLi = text(form, 'social_li') || null;
  const socialYt = text(form, 'social_yt') || null;
  if (!name || name.length > 160) throw new Error('NAME_REQUIRED');
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error('PHONE_COUNTRY_CODE_REQUIRED');
  if (!['whatsapp', 'telegram', 'both'].includes(phoneType)) throw new Error('PHONE_TYPE_INVALID');
  if (!/^\d{6,20}$/.test(nidNumber.replace(/ /g, ''))) throw new Error('NID_NUMBER_INVALID');
  const keys: Partial<Record<ImageField, string>> = {};
  const uploaded: string[] = [];
  try {
    for (const field of IMAGE_FIELDS) {
      const file = image(form, field);
      const oldKey = field === 'nid_front' ? existing?.nid_front_key : field === 'nid_back' ? existing?.nid_back_key : field === 'selfie' ? existing?.selfie_key : existing?.profile_image_key;
      if (oldKey) { keys[field] = String(oldKey); continue; }
      if (!file && field !== 'profile_image') throw new Error(`${field.toUpperCase()}_REQUIRED`);
      if (file) {
        if (file.size > MAX_IMAGE_BYTES || !file.type.startsWith('image/')) throw new Error(`${field.toUpperCase()}_INVALID`);
        const key = `kyc/${safePart(identity.userId)}/${field}-${crypto.randomUUID()}.webp`;
        await env.KYC_BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { owner: identity.userId, field } });
        keys[field] = key; uploaded.push(key);
      }
    }
    const duplicate = await sql`select id from mecopay_heart.profiles where nid_number = ${nidNumber} and id <> ${identity.userId} limit 1`;
    if (duplicate.length) throw new Error('NID_ALREADY_USED');
    const rows = await sql`insert into mecopay_heart.profiles
      (id, name, email, phone, phone_type, nid_number, nid_front_key, nid_back_key, selfie_key, profile_image_key,
       website_url, social_fb, social_insta, social_li, social_yt, verification_status, rejection_reason, updated_at)
      values (${identity.userId}, ${name}, ${identity.email}, ${phone}, ${phoneType}, ${nidNumber},
        ${keys.nid_front || existing?.nid_front_key || null}, ${keys.nid_back || existing?.nid_back_key || null},
        ${keys.selfie || existing?.selfie_key || null}, ${keys.profile_image || existing?.profile_image_key || null},
        ${websiteUrl}, ${socialFb}, ${socialInsta}, ${socialLi}, ${socialYt},
        ${existing?.verification_status === 'verified' ? 'verified' : 'pending'}, null, now())
      on conflict (id) do update set name=excluded.name, email=excluded.email, phone=excluded.phone, phone_type=excluded.phone_type,
        nid_number=excluded.nid_number, nid_front_key=coalesce(mecopay_heart.profiles.nid_front_key, excluded.nid_front_key),
        nid_back_key=coalesce(mecopay_heart.profiles.nid_back_key, excluded.nid_back_key), selfie_key=coalesce(mecopay_heart.profiles.selfie_key, excluded.selfie_key),
        profile_image_key=coalesce(excluded.profile_image_key, mecopay_heart.profiles.profile_image_key), website_url=excluded.website_url,
        social_fb=excluded.social_fb, social_insta=excluded.social_insta, social_li=excluded.social_li, social_yt=excluded.social_yt,
        verification_status=case when mecopay_heart.profiles.verification_status = 'verified' then 'verified' else 'pending' end,
        rejection_reason=null, updated_at=now() returning id, verification_status`;
    const now = Math.floor(Date.now() / 1000);
    const refreshed = await signJwt({ ...claims, sub: claims.sub, client_id: identity.userId, iat: now, exp: now + 7 * 24 * 60 * 60 }, env);
    return { profile: rows[0], token: refreshed, uploaded };
  } catch (error) {
    await Promise.all(uploaded.map(key => env.KYC_BUCKET.delete(key)));
    throw error;
  }
}
async function media(request: Request, env: Env, claims: Claims) {
  const sql = neon(env.HYPERDRIVE.connectionString) as unknown as Sql;
  const identity = await resolveIdentity(sql, claims);
  const profile = await loadProfile(sql, String(claims.client_id || identity.userId));
  if (!profile || String(profile.id) !== identity.userId) return json({ error: 'FORBIDDEN' }, 403, originHeaders(request, env));
  const kind = new URL(request.url).searchParams.get('kind');
  const key = kind === 'nid_front' ? profile.nid_front_key : kind === 'nid_back' ? profile.nid_back_key : kind === 'selfie' ? profile.selfie_key : kind === 'profile_image' ? profile.profile_image_key : null;
  if (!key) return new Response('Not found', { status: 404 });
  const object = await env.KYC_BUCKET.get(String(key));
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers({ 'cache-control': 'private, no-store', 'content-type': object.httpMetadata?.contentType || 'image/webp' });
  return new Response(object.body, { headers });
}
export default {
  async fetch(request: Request, env: Env) {
    const headers = originHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'access-control-allow-methods': 'POST, GET, OPTIONS', 'access-control-allow-headers': 'content-type, authorization' } });
    const url = new URL(request.url);
    if (url.pathname === '/api/mother-write' && request.method === 'GET') return json({ ok: true, service: 'motherwrite' }, 200, headers);
    if (!url.pathname.startsWith('/api/mother-write')) return json({ error: 'NOT_FOUND' }, 404, headers);
    let claims: Claims;
    try { claims = await verifyJwt(cookieToken(request), env); } catch (error) { return json({ error: error instanceof Error ? error.message : 'UNAUTHORIZED' }, 401, headers); }
    try {
      if (url.pathname.endsWith('/media') && request.method === 'GET') return media(request, env, claims);
      if (url.pathname.endsWith('/session') && request.method === 'GET') {
        const sql = neon(env.HYPERDRIVE.connectionString) as unknown as Sql;
        const identity = await resolveIdentity(sql, claims);
        const profile = await loadProfile(sql, identity.userId);
        return json(profile ? { ...profile, nid_front_key: profile.nid_front_key || null, nid_back_key: profile.nid_back_key || null, selfie_key: profile.selfie_key || null } : null, 200, headers);
      }
      if (url.pathname === '/api/mother-write' && request.method === 'POST') {
        const result = await saveProfile(request, env, claims);
        return json({ ok: true, client_id: result.profile.id, profile: result.profile }, 200, { ...headers, 'set-cookie': cookieHeader(result.token, 7 * 24 * 60 * 60) });
      }
      return json({ error: 'METHOD_NOT_ALLOWED' }, 405, headers);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'MOTHER_WRITE_FAILED';
      const status = /REQUIRED|INVALID|ALREADY_USED/.test(message) ? 400 : message === 'FORBIDDEN' ? 403 : 500;
      console.error('[motherwrite]', message);
      return json({ error: message }, status, headers);
    }
  }
};
