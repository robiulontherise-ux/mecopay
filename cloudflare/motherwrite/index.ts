import { neon } from '@neondatabase/serverless';

interface Env {
  HYPERDRIVE: { connectionString: string };
  KYC_BUCKET: R2Bucket;
  CONTEXT_CACHE: KVNamespace;
  JWT_PRIVATE_KEY: string;
  BETTER_AUTH_URL?: string;
  ALLOWED_ORIGIN?: string;
}

type Claims = Record<string, unknown> & { sub: string; exp: number; iat: number; iss?: string; aud?: string; jti?: string };
type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<any[]>;
const COOKIE = '__Host-mecopay_jwt';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_FIELDS = ['nid_front', 'nid_back', 'selfie', 'profile_image'] as const;
const IMMUTABLE_IMAGE_FIELDS = ['nid_front', 'nid_back', 'selfie'] as const;
const AUTH_JWT_KID = 'authworker-es256-1';
const AUTH_JWT_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGwAvwUqZUWi8pk4ELHSOHL3iNp/A
llaQbGmGcXZNqIkLJyYNqEPkWCy6RJULJXjZMUNDQVuRtbNbDF1szdItKA==
-----END PUBLIC KEY-----`;
type ImageField = typeof IMAGE_FIELDS[number];
type Profile = Record<string, unknown> & { id: string; nid_front_key?: string | null; nid_back_key?: string | null; selfie_key?: string | null; profile_image_key?: string | null; nid_number?: string | null; verification_status?: string | null };
type Identity = { userId: string; email: string | null; profile: Profile | null };
type CachedContext = { client_id: string; profile_complete: boolean; brand_ids: string[]; updated_at: number };

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
async function verificationKey() {
  return crypto.subtle.importKey('spki', pemBytes(AUTH_JWT_PUBLIC_KEY_PEM), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
}
async function verifyJwt(token: string, env: Env): Promise<Claims> {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0].length > 2048 || parts[1].length > 8192 || parts[2].length > 2048) throw new Error('INVALID_TOKEN');
  const header = JSON.parse(new TextDecoder().decode(b64uBytes(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(b64uBytes(parts[1]))) as Claims;
  const now = Math.floor(Date.now() / 1000);
  if (header.alg !== 'ES256' || header.typ !== 'JWT' || header.kid !== AUTH_JWT_KID || typeof payload.sub !== 'string' || !payload.sub || typeof payload.exp !== 'number' || payload.exp <= now || typeof payload.iat !== 'number' || payload.iat > now + 300) throw new Error('INVALID_TOKEN');
  if (!env.BETTER_AUTH_URL || payload.iss !== env.BETTER_AUTH_URL) throw new Error('INVALID_TOKEN_ISSUER');
  if (payload.aud !== 'mother-dashboard') throw new Error('INVALID_TOKEN_AUDIENCE');
  if (payload.surface !== 'mother') throw new Error('INVALID_TOKEN_SURFACE');
  const key = await verificationKey();
  const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64uBytes(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if (!valid) throw new Error('INVALID_TOKEN');
  return payload;
}
async function signJwt(claims: Claims, env: Env) {
  const header = b64u(new TextEncoder().encode(JSON.stringify({ alg: 'ES256', typ: 'JWT', kid: AUTH_JWT_KID })));
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
function originHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get('origin');
  const allowed = env.ALLOWED_ORIGIN || new URL(request.url).origin;
  const headers: Record<string, string> = { vary: 'Origin' };
  if (origin === allowed) { headers['access-control-allow-origin'] = origin; headers['access-control-allow-credentials'] = 'true'; }
  return headers;
}
function text(form: FormData, name: string) { return String(form.get(name) || '').trim(); }
function image(form: FormData, name: ImageField): File | null {
  const value = form.get(name) as unknown as string | File | null;
  return value && typeof value !== 'string' && typeof value.size === 'number' && value.size > 0 ? value : null;
}
function validateImage(file: File | null, field: ImageField) {
  if (!file) return;
  if (file.size > MAX_IMAGE_BYTES || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error(`${field.toUpperCase()}_INVALID`);
}
function safePart(value: string) { return value.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80); }
function extension(type: string) { return type === 'image/png' ? 'png' : type === 'image/jpeg' ? 'jpg' : 'webp'; }
function parseSubject(sub: string) {
  const [provider, ...rest] = sub.split(':');
  const accountId = rest.join(':');
  if (!provider || !accountId || !['email', 'google', 'telegram'].includes(provider)) throw new Error('IDENTITY_MAPPING_NOT_FOUND');
  return { provider, accountId };
}
async function readIdentityAndProfile(sql: Sql, claims: Claims): Promise<Identity> {
  const { provider, accountId } = parseSubject(claims.sub);
  const rows = await sql`select u.id as user_id, u.email as user_email,
      p.id as profile_id, p.name as name, p.email as email, p.phone as phone, p.phone_type as phone_type,
      p.verification_status as verification_status, p.rejection_reason as rejection_reason,
      p.nid_number as nid_number, p.nid_front_key as nid_front_key, p.nid_back_key as nid_back_key,
      p.selfie_key as selfie_key, p.profile_image_key as profile_image_key, p.website_url as website_url,
      p.social_fb as social_fb, p.social_insta as social_insta, p.social_li as social_li, p.social_yt as social_yt
    from mecopay_auth.account a
    join mecopay_auth."user" u on u.id = a."userId"
    left join mecopay_heart.profiles p on p.id = u.id
    where a."providerId" = ${provider} and a."accountId" = ${accountId} limit 1`;
  if (!rows[0]?.user_id) throw new Error('IDENTITY_MAPPING_NOT_FOUND');
  const row = rows[0];
  const profile: Profile | null = row.profile_id ? {
    id: String(row.profile_id), name: row.name, email: row.email, phone: row.phone, phone_type: row.phone_type,
    verification_status: row.verification_status, rejection_reason: row.rejection_reason, nid_number: row.nid_number,
    nid_front_key: row.nid_front_key, nid_back_key: row.nid_back_key, selfie_key: row.selfie_key,
    profile_image_key: row.profile_image_key, website_url: row.website_url, social_fb: row.social_fb,
    social_insta: row.social_insta, social_li: row.social_li, social_yt: row.social_yt
  } : null;
  return { userId: String(row.user_id), email: row.user_email || null, profile };
}
async function loadProfile(sql: Sql, clientId: string) {
  const rows = await sql`select id, name, email, phone, phone_type, verification_status, rejection_reason,
      nid_number, nid_front_key, nid_back_key, selfie_key, profile_image_key, website_url,
      social_fb, social_insta, social_li, social_yt
    from mecopay_heart.profiles where id = ${clientId} limit 1`;
  return (rows[0] as Profile | undefined) || null;
}
async function contextKey(sub: string) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sub)));
  return `sub:${Array.from(digest, b => b.toString(16).padStart(2, '0')).join('')}`;
}
async function readCachedContext(env: Env, sub: string): Promise<CachedContext | null> {
  try {
    const value = await env.CONTEXT_CACHE.get<CachedContext>(await contextKey(sub), 'json');
    if (value && typeof value.client_id === 'string' && typeof value.profile_complete === 'boolean') return value;
  } catch (error) { console.warn('[motherwrite] context cache read failed', error); }
  return null;
}
async function writeCachedContext(env: Env, sub: string, context: CachedContext) {
  try { await env.CONTEXT_CACHE.put(await contextKey(sub), JSON.stringify(context), { expirationTtl: 3600 }); }
  catch (error) { console.warn('[motherwrite] context cache write failed', error); }
}
function profileComplete(profile: Profile | null) {
  return Boolean(profile?.name && profile.phone && profile.phone_type && profile.nid_number && profile.nid_front_key && profile.nid_back_key && profile.selfie_key);
}
async function saveProfile(request: Request, env: Env, claims: Claims) {
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

  const files = Object.fromEntries(IMAGE_FIELDS.map(field => [field, image(form, field)])) as Record<ImageField, File | null>;
  for (const field of IMAGE_FIELDS) validateImage(files[field], field);
  // New profiles must include every required KYC image before any database or storage operation.
  if (!claims.client_id) {
    for (const field of IMMUTABLE_IMAGE_FIELDS) if (!files[field]) throw new Error(`${field.toUpperCase()}_REQUIRED`);
  }

  const sql = neon(env.HYPERDRIVE.connectionString) as unknown as Sql;
  const identity = await readIdentityAndProfile(sql, claims);
  if (claims.client_id && String(claims.client_id) !== identity.userId) throw new Error('FORBIDDEN');
  const existing = identity.profile;
  const keys: Partial<Record<ImageField, string>> = {};
  const uploaded: string[] = [];
  let committed = false;
  const oldProfileImage = existing?.profile_image_key ? String(existing.profile_image_key) : null;
  try {
    for (const field of IMAGE_FIELDS) {
      const oldKey = existing?.[field === 'nid_front' ? 'nid_front_key' : field === 'nid_back' ? 'nid_back_key' : field === 'selfie' ? 'selfie_key' : 'profile_image_key'];
      if (IMMUTABLE_IMAGE_FIELDS.includes(field as typeof IMMUTABLE_IMAGE_FIELDS[number]) && oldKey) {
        keys[field] = String(oldKey);
        continue;
      }
      const file = files[field];
      if (!file) {
        if (IMMUTABLE_IMAGE_FIELDS.includes(field as typeof IMMUTABLE_IMAGE_FIELDS[number])) throw new Error(`${field.toUpperCase()}_REQUIRED`);
        keys[field] = oldKey ? String(oldKey) : '';
        continue;
      }
      const key = `kyc/${safePart(identity.userId)}/${field}-${crypto.randomUUID()}.${extension(file.type)}`;
      await env.KYC_BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { owner: identity.userId, field } });
      keys[field] = key;
      uploaded.push(key);
    }

    const { provider, accountId } = parseSubject(claims.sub);
    const rows = await sql`with identity_row as (
        select u.id as user_id, u.email as email
        from mecopay_auth.account a
        join mecopay_auth."user" u on u.id = a."userId"
        where a."providerId" = ${provider} and a."accountId" = ${accountId} limit 1
      ), duplicate_nid as (
        select 1 from mecopay_heart.profiles p, identity_row i
        where p.nid_number = ${nidNumber} and p.id <> i.user_id limit 1
      ), saved as (
        insert into mecopay_heart.profiles
          (id, name, email, phone, phone_type, nid_number, nid_front_key, nid_back_key, selfie_key, profile_image_key,
           website_url, social_fb, social_insta, social_li, social_yt, verification_status, rejection_reason, updated_at)
        select i.user_id, ${name}, i.email, ${phone}, ${phoneType}, ${nidNumber},
          ${keys.nid_front || existing?.nid_front_key || null}, ${keys.nid_back || existing?.nid_back_key || null},
          ${keys.selfie || existing?.selfie_key || null}, ${keys.profile_image || null},
          ${websiteUrl}, ${socialFb}, ${socialInsta}, ${socialLi}, ${socialYt}, 'pending', null, now()
        from identity_row i
        where not exists (select 1 from duplicate_nid)
        on conflict (id) do update set
          name=excluded.name, email=excluded.email, phone=excluded.phone, phone_type=excluded.phone_type,
          nid_number=excluded.nid_number,
          nid_front_key=coalesce(mecopay_heart.profiles.nid_front_key, excluded.nid_front_key),
          nid_back_key=coalesce(mecopay_heart.profiles.nid_back_key, excluded.nid_back_key),
          selfie_key=coalesce(mecopay_heart.profiles.selfie_key, excluded.selfie_key),
          profile_image_key=coalesce(excluded.profile_image_key, mecopay_heart.profiles.profile_image_key),
          website_url=excluded.website_url, social_fb=excluded.social_fb, social_insta=excluded.social_insta,
          social_li=excluded.social_li, social_yt=excluded.social_yt,
          verification_status=case when mecopay_heart.profiles.verification_status = 'verified' then 'verified' else 'pending' end,
          rejection_reason=null, updated_at=now()
        returning id, verification_status
      )
      select i.user_id, s.id, s.verification_status, exists(select 1 from duplicate_nid) as duplicate
      from identity_row i left join saved s on true`;
    if (!rows[0]?.user_id) throw new Error('IDENTITY_MAPPING_NOT_FOUND');
    if (rows[0].duplicate) throw new Error('NID_ALREADY_USED');
    if (!rows[0].id) throw new Error('MOTHER_WRITE_FAILED');
    committed = true;
    const profile = { id: String(rows[0].id), verification_status: String(rows[0].verification_status || 'pending') };
    await writeCachedContext(env, claims.sub, { client_id: profile.id, profile_complete: true, brand_ids: [], updated_at: Date.now() });
    if (oldProfileImage && keys.profile_image && keys.profile_image !== oldProfileImage) {
      try { await env.KYC_BUCKET.delete(oldProfileImage); } catch (error) { console.warn('[motherwrite] old profile image cleanup failed', error); }
    }
    const now = Math.floor(Date.now() / 1000);
    const refreshed = await signJwt({ ...claims, sub: claims.sub, client_id: profile.id, iat: now, exp: now + 7 * 24 * 60 * 60, jti: crypto.randomUUID() }, env);
    return { profile, token: refreshed };
  } catch (error) {
    if (!committed) await Promise.all(uploaded.map(key => env.KYC_BUCKET.delete(key)));
    throw error;
  }
}
async function media(request: Request, env: Env, claims: Claims) {
  const sql = neon(env.HYPERDRIVE.connectionString) as unknown as Sql;
  const cached = await readCachedContext(env, claims.sub);
  const identity = cached?.client_id ? { userId: cached.client_id, email: null, profile: null } : await readIdentityAndProfile(sql, claims);
  if (!cached) await writeCachedContext(env, claims.sub, { client_id: identity.userId, profile_complete: profileComplete(identity.profile), brand_ids: [], updated_at: Date.now() });
  if (claims.client_id && String(claims.client_id) !== identity.userId) return json({ error: 'FORBIDDEN' }, 403);
  const profile = await loadProfile(sql, identity.userId);
  if (!profile || String(profile.id) !== identity.userId) return json({ error: 'FORBIDDEN' }, 403);
  const kind = new URL(request.url).searchParams.get('kind');
  const key = kind === 'nid_front' ? profile.nid_front_key : kind === 'nid_back' ? profile.nid_back_key : kind === 'selfie' ? profile.selfie_key : kind === 'profile_image' ? profile.profile_image_key : null;
  if (!key) return new Response('Not found', { status: 404 });
  const object = await env.KYC_BUCKET.get(String(key));
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers({ 'cache-control': 'private, no-store', 'content-type': object.httpMetadata?.contentType || 'application/octet-stream', 'x-content-type-options': 'nosniff' });
  return new Response(object.body, { headers });
}
async function session(request: Request, env: Env, claims: Claims) {
  const sql = neon(env.HYPERDRIVE.connectionString) as unknown as Sql;
  const cached = await readCachedContext(env, claims.sub);
  if (cached) {
    if (claims.client_id && String(claims.client_id) !== cached.client_id) return json({ error: 'FORBIDDEN' }, 403);
    return json(await loadProfile(sql, cached.client_id), 200, originHeaders(request, env));
  }
  const identity = await readIdentityAndProfile(sql, claims);
  if (claims.client_id && String(claims.client_id) !== identity.userId) return json({ error: 'FORBIDDEN' }, 403, originHeaders(request, env));
  await writeCachedContext(env, claims.sub, { client_id: identity.userId, profile_complete: profileComplete(identity.profile), brand_ids: [], updated_at: Date.now() });
  return json(identity.profile, 200, originHeaders(request, env));
}
export default {
  async fetch(request: Request, env: Env) {
    const headers = originHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'access-control-allow-methods': 'POST, GET, OPTIONS', 'access-control-allow-headers': 'content-type, authorization' } });
    const url = new URL(request.url);
    if (url.pathname === '/api/mother-write' && request.method === 'GET') return json({ ok: true, service: 'motherwrite' }, 200, headers);
    if (!url.pathname.startsWith('/api/mother-write')) return json({ error: 'NOT_FOUND' }, 404, headers);
    let claims: Claims;
    try { claims = await verifyJwt(cookieToken(request), env); }
    catch (error) { return json({ error: error instanceof Error ? error.message : 'UNAUTHORIZED' }, 401, headers); }
    try {
      if (url.pathname.endsWith('/media') && request.method === 'GET') return await media(request, env, claims);
      if (url.pathname.endsWith('/session') && request.method === 'GET') return await session(request, env, claims);
      if (url.pathname === '/api/mother-write' && request.method === 'POST') {
        if (request.headers.get('origin') && request.headers.get('origin') !== (env.ALLOWED_ORIGIN || new URL(request.url).origin)) return json({ error: 'ORIGIN_NOT_ALLOWED' }, 403, headers);
        const result = await saveProfile(request, env, claims);
        return json({ ok: true, client_id: result.profile.id, profile: result.profile }, 200, { ...headers, 'set-cookie': cookieHeader(result.token, 7 * 24 * 60 * 60) });
      }
      return json({ error: 'METHOD_NOT_ALLOWED' }, 405, headers);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'MOTHER_WRITE_FAILED';
      const status = /REQUIRED|INVALID|ALREADY_USED|LOCKED/.test(message) ? 400 : message === 'FORBIDDEN' ? 403 : 500;
      console.error('[motherwrite]', message);
      return json({ error: message }, status, headers);
    }
  }
};
