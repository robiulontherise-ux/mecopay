import { neon } from '@neondatabase/serverless';

interface Env {
  HYPERDRIVE: { connectionString: string };
  KYC_BUCKET: R2Bucket;
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
type CachedContext = { userId: string; profile: Profile | null; expiresAt: number };
const contextCache = new Map<string, CachedContext>();
// Independent Worker-isolate profile/context cache; this is not an Auth JWT lifetime.
const PROFILE_CONTEXT_CACHE_TTL_MS = 5 * 60 * 1000;
const PROFILE_CONTEXT_CACHE_MAX_ENTRIES = 500;

function json(body: unknown, status = 200, extra: HeadersInit = {}) {
  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  new Headers(extra).forEach((value, key) => headers.set(key, value));
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
function readCachedContext(sub: string): CachedContext | null {
  const value = contextCache.get(sub);
  if (!value) return null;
  if (value.expiresAt <= Date.now()) {
    contextCache.delete(sub);
    return null;
  }
  contextCache.delete(sub);
  contextCache.set(sub, value);
  return value;
}
function writeCachedContext(sub: string, userId: string, profile: Profile | null) {
  if (contextCache.size >= PROFILE_CONTEXT_CACHE_MAX_ENTRIES && !contextCache.has(sub)) {
    const oldest = contextCache.keys().next().value;
    if (oldest) contextCache.delete(oldest);
  }
  contextCache.set(sub, { userId, profile, expiresAt: Date.now() + PROFILE_CONTEXT_CACHE_TTL_MS });
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
  if (!claims.client_id) {
    if (!name || name.length > 160) throw new Error('NAME_REQUIRED');
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error('PHONE_COUNTRY_CODE_REQUIRED');
    if (!['whatsapp', 'telegram', 'both'].includes(phoneType)) throw new Error('PHONE_TYPE_INVALID');
    if (!/^\d{6,20}$/.test(nidNumber.replace(/ /g, ''))) throw new Error('NID_NUMBER_INVALID');
  } else {
    if (name && name.length > 160) throw new Error('NAME_INVALID');
    if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error('PHONE_INVALID');
    if (phoneType && !['whatsapp', 'telegram', 'both'].includes(phoneType)) throw new Error('PHONE_TYPE_INVALID');
    if (nidNumber && !/^\d{6,20}$/.test(nidNumber.replace(/ /g, ''))) throw new Error('NID_NUMBER_INVALID');
  }

  const files = Object.fromEntries(IMAGE_FIELDS.map(field => [field, image(form, field)])) as Record<ImageField, File | null>;
  for (const field of IMAGE_FIELDS) validateImage(files[field], field);
  if (!claims.client_id) {
    for (const field of IMMUTABLE_IMAGE_FIELDS) if (!files[field]) throw new Error(`${field.toUpperCase()}_REQUIRED`);
  }

  const { provider, accountId } = parseSubject(claims.sub);
  const keys: Partial<Record<ImageField, string>> = {};
  const uploaded: string[] = [];
  let committed = false;
  try {
    // R2 keys use the JWT's account identity; Neon resolves the canonical user/profile ID below.
    for (const field of IMAGE_FIELDS) {
      const file = files[field];
      if (!file) continue;
      const key = `kyc/${safePart(provider)}/${safePart(accountId)}/${field}-${crypto.randomUUID()}.${extension(file.type)}`;
      await env.KYC_BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { account: accountId, field } });
      keys[field] = key;
      uploaded.push(key);
    }

    // The login JWT is short-lived. Do not silently extend its lifetime in MotherWrite.
    if (claims.exp <= Math.floor(Date.now() / 1000)) throw new Error('TOKEN_EXPIRED');
    const sql = neon(env.HYPERDRIVE.connectionString) as unknown as Sql;
    const rows = await sql`with identity_row as (
        select u.id as user_id, u.email as email,
          p.name as old_name, p.phone as old_phone, p.phone_type as old_phone_type, p.nid_number as old_nid_number,
          p.website_url as old_website_url, p.social_fb as old_social_fb, p.social_insta as old_social_insta,
          p.social_li as old_social_li, p.social_yt as old_social_yt,
          p.nid_front_key as old_nid_front_key, p.nid_back_key as old_nid_back_key,
          p.selfie_key as old_selfie_key, p.profile_image_key as old_profile_image_key
        from mecopay_auth.account a
        join mecopay_auth."user" u on u.id = a."userId"
        left join mecopay_heart.profiles p on p.id = u.id
        where a."providerId" = ${provider} and a."accountId" = ${accountId} limit 1
      ), duplicate_nid as (
        select 1 from mecopay_heart.profiles p, identity_row i
        where p.nid_number = coalesce(nullif(${nidNumber}, ''), i.old_nid_number)
          and coalesce(nullif(${nidNumber}, ''), i.old_nid_number) is not null
          and p.id <> i.user_id limit 1
      ), saved as (
        insert into mecopay_heart.profiles
          (id, name, email, phone, phone_type, nid_number, nid_front_key, nid_back_key, selfie_key, profile_image_key,
           website_url, social_fb, social_insta, social_li, social_yt, verification_status, rejection_reason, updated_at)
        select i.user_id, coalesce(nullif(${name}, ''), i.old_name), i.email,
          coalesce(nullif(${phone}, ''), i.old_phone), coalesce(nullif(${phoneType}, ''), i.old_phone_type),
          coalesce(nullif(${nidNumber}, ''), i.old_nid_number),
          coalesce(${keys.nid_front || null}, i.old_nid_front_key), coalesce(${keys.nid_back || null}, i.old_nid_back_key),
          coalesce(${keys.selfie || null}, i.old_selfie_key), coalesce(${keys.profile_image || null}, i.old_profile_image_key),
          case when ${form.has('website_url')} then nullif(${websiteUrl || ''}, '') else i.old_website_url end,
          case when ${form.has('social_fb')} then nullif(${socialFb || ''}, '') else i.old_social_fb end,
          case when ${form.has('social_insta')} then nullif(${socialInsta || ''}, '') else i.old_social_insta end,
          case when ${form.has('social_li')} then nullif(${socialLi || ''}, '') else i.old_social_li end,
          case when ${form.has('social_yt')} then nullif(${socialYt || ''}, '') else i.old_social_yt end,
          'pending', null, now()
        from identity_row i
        where not exists (select 1 from duplicate_nid)
          and (${claims.client_id ? String(claims.client_id) : null}::text is null
            or i.user_id::text = ${claims.client_id ? String(claims.client_id) : null}::text)
          and coalesce(i.old_nid_front_key, ${keys.nid_front || null}) is not null
          and coalesce(i.old_nid_back_key, ${keys.nid_back || null}) is not null
          and coalesce(i.old_selfie_key, ${keys.selfie || null}) is not null
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
        returning id, name, email, phone, phone_type, verification_status, rejection_reason, nid_number,
          nid_front_key, nid_back_key, selfie_key, profile_image_key, website_url, social_fb, social_insta, social_li, social_yt
      )
      select i.user_id, i.email as user_email, i.old_profile_image_key,
        (${claims.client_id ? String(claims.client_id) : null}::text is null
          or i.user_id::text = ${claims.client_id ? String(claims.client_id) : null}::text) as client_match,
        s.id, s.name, s.email, s.phone, s.phone_type, s.verification_status, s.rejection_reason, s.nid_number,
        s.nid_front_key, s.nid_back_key, s.selfie_key, s.profile_image_key, s.website_url,
        s.social_fb, s.social_insta, s.social_li, s.social_yt, exists(select 1 from duplicate_nid) as duplicate
      from identity_row i left join saved s on true`;
    if (!rows[0]?.user_id) throw new Error('IDENTITY_MAPPING_NOT_FOUND');
    if (rows[0].duplicate) throw new Error('NID_ALREADY_USED');
    if (!rows[0].client_match) throw new Error('FORBIDDEN');
    if (!rows[0].id) {
      if (!rows[0].old_nid_front_key && !keys.nid_front) throw new Error('NID_FRONT_REQUIRED');
      if (!rows[0].old_nid_back_key && !keys.nid_back) throw new Error('NID_BACK_REQUIRED');
      if (!rows[0].old_selfie_key && !keys.selfie) throw new Error('SELFIE_REQUIRED');
      throw new Error('MOTHER_WRITE_FAILED');
    }
    if (claims.client_id && String(claims.client_id) !== String(rows[0].user_id)) throw new Error('FORBIDDEN');
    committed = true;
    const row = rows[0];
    const profile = {
      id: String(row.id), name: row.name, email: row.email, phone: row.phone, phone_type: row.phone_type,
      verification_status: row.verification_status, rejection_reason: row.rejection_reason, nid_number: row.nid_number,
      nid_front_key: row.nid_front_key, nid_back_key: row.nid_back_key, selfie_key: row.selfie_key,
      profile_image_key: row.profile_image_key, website_url: row.website_url, social_fb: row.social_fb,
      social_insta: row.social_insta, social_li: row.social_li, social_yt: row.social_yt
    } as Profile;
    writeCachedContext(claims.sub, profile.id, profile);
    const storedKeys: Partial<Record<ImageField, string | null>> = {
      nid_front: profile.nid_front_key || null, nid_back: profile.nid_back_key || null,
      selfie: profile.selfie_key || null, profile_image: profile.profile_image_key || null
    };
    const redundant = uploaded.filter(key => !Object.values(storedKeys).includes(key));
    await Promise.all(redundant.map(key => env.KYC_BUCKET.delete(key).catch(error => console.warn('[motherwrite] unused upload cleanup failed', error))));
    const oldProfileImage = row.old_profile_image_key ? String(row.old_profile_image_key) : null;
    if (oldProfileImage && profile.profile_image_key && String(profile.profile_image_key) !== oldProfileImage) {
      await env.KYC_BUCKET.delete(oldProfileImage).catch(error => console.warn('[motherwrite] old profile image cleanup failed', error));
    }
    // Only the first successful profile save adds the canonical profile/user ID to JWT.
    // Existing client_id is validated by the SQL identity mapping above and left untouched.
    const token = claims.client_id ? null : await signJwt({ ...claims, sub: claims.sub, client_id: profile.id }, env);
    return { profile, token };
  } catch (error) {
    if (!committed) await Promise.all(uploaded.map(key => env.KYC_BUCKET.delete(key).catch(() => undefined)));
    throw error;
  }
}
async function media(request: Request, env: Env, claims: Claims) {
  let context = readCachedContext(claims.sub);
  if (!context) {
    const sql = neon(env.HYPERDRIVE.connectionString) as unknown as Sql;
    const identity = await readIdentityAndProfile(sql, claims);
    context = { userId: identity.userId, profile: identity.profile, expiresAt: Date.now() + PROFILE_CONTEXT_CACHE_TTL_MS };
    writeCachedContext(claims.sub, context.userId, context.profile);
  }
  if (claims.client_id && String(claims.client_id) !== context.userId) return json({ error: 'FORBIDDEN' }, 403);
  const profile = context.profile;
  if (!profile || String(profile.id) !== context.userId) return new Response('Not found', { status: 404 });
  const kind = new URL(request.url).searchParams.get('kind');
  const key = kind === 'nid_front' ? profile.nid_front_key : kind === 'nid_back' ? profile.nid_back_key : kind === 'selfie' ? profile.selfie_key : kind === 'profile_image' ? profile.profile_image_key : null;
  if (!key) return new Response('Not found', { status: 404 });
  const object = await env.KYC_BUCKET.get(String(key));
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers({ 'cache-control': 'private, no-store', 'content-type': object.httpMetadata?.contentType || 'application/octet-stream', 'x-content-type-options': 'nosniff' });
  return new Response(object.body, { headers });
}
async function session(request: Request, env: Env, claims: Claims) {
  let context = readCachedContext(claims.sub);
  if (!context) {
    const sql = neon(env.HYPERDRIVE.connectionString) as unknown as Sql;
    const identity = await readIdentityAndProfile(sql, claims);
    context = { userId: identity.userId, profile: identity.profile, expiresAt: Date.now() + PROFILE_CONTEXT_CACHE_TTL_MS };
    writeCachedContext(claims.sub, context.userId, context.profile);
  }
  if (claims.client_id && String(claims.client_id) !== context.userId) return json({ error: 'FORBIDDEN' }, 403, originHeaders(request, env));
  return json(context.profile, 200, originHeaders(request, env));
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
        const { id: _profileId, ...profileForBrowser } = result.profile;
        const responseHeaders = new Headers(headers);
        if (result.token) responseHeaders.set('set-cookie', cookieHeader(result.token, Math.max(0, claims.exp - Math.floor(Date.now() / 1000))));
        return json({ ok: true, profile: profileForBrowser }, 200, responseHeaders);
      }
      return json({ error: 'METHOD_NOT_ALLOWED' }, 405, headers);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'MOTHER_WRITE_FAILED';
      const status = /REQUIRED|INVALID|ALREADY_USED|LOCKED/.test(message) ? 400 : message === 'FORBIDDEN' ? 403 : message === 'TOKEN_EXPIRED' ? 401 : 500;
      console.error('[motherwrite]', message);
      return json({ error: message }, status, headers);
    }
  }
};
