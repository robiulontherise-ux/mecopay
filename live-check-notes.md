# MotherWrite live-check notes — 2026-11-28

## Verified production state

- Connected repository: `https://github.com/robiulontherise-ux/mecopay.git`, branch `main`.
- Cloudflare account: `fd4363e9cfebedcb962b3e0c74e113da`.
- Route `mecopay.space/api/mother-write*` → `motherwrite` was created (route ID `3b74cd51f88148d7a8c37bae3f36d07d`).
- The corrected Worker is deployed as version `5b421dbf-f957-47bd-b308-434652be20ae` (version 12), with a current deployment at 100%. The prior version `2b7057c5-a486-4657-86db-df540583bde7` remains in deployment history.
- Live Worker settings include `ALLOWED_ORIGIN=https://mecopay.space`, `BETTER_AUTH_URL=https://mecopay.space`, Hyperdrive `aa216e60610b4ecd8695f95a8e8a566b`, R2 `mecopay-kyc`, and secret bindings `JWT_PRIVATE_KEY` and `PROBE_TOKEN`. Secret values were not read or exposed.
- The mistakenly created, unbound KV namespace was verified empty and deleted. MotherWrite source and Wrangler config now use only an isolate-local bounded Worker `Map` cache; no KV binding is configured.

## Live HTTP checks (2026-11-28 09:32 UTC)

- `GET https://mecopay.space/api/mother-write` → HTTP 200, JSON health response.
- `GET https://mecopay.space/api/mother-write/session` without credentials → HTTP 401.
- Unauthenticated multipart `POST https://mecopay.space/api/mother-write` → HTTP 401.
- No authenticated profile save, KYC upload, or JWT refresh-continuity test was run; no real production profile data was written.

## Post-deployment checks (2026-11-28 10:07 UTC)

- Cloudflare API token verification returned active; token value was not printed or saved in the repository.
- Worker version `5b421dbf-f957-47bd-b308-434652be20ae` is deployed at 100%.
- Live bindings include `JWT_PRIVATE_KEY` secret, `HYPERDRIVE`, `KYC_BUCKET`, and the expected origin/issuer variables; KV is absent. Secret contents were not read.
- `GET /api/mother-write` → HTTP 200; unauthenticated `GET /api/mother-write/session` → HTTP 401 (`INVALID_TOKEN`).
- No authenticated profile save/KYC upload or JWT refresh-continuity test was run; no production profile data was written.

## Clarified save/cache contract and follow-up deployment (2026-11-28 10:17 UTC)

- The login JWT's 5-minute validity is separate from the Worker profile-context cache. Form text/files/object keys exist in request-local Worker memory while that request uploads to R2 and executes its one Neon statement; that request-local data does not use a five-minute cache timer.
- The separate isolate-local `Map` caches resolved profile context only for `/session` and `/media` reads, with a 5-minute entry lifetime and 500-entry capacity. These values are cache freshness/capacity controls, not JWT rules; cache misses fall back to Neon.
- First successful profile save adds the canonical existing user/profile row ID as the JWT `client_id` claim, signs with the existing Worker private-key binding, and returns the token only in the HttpOnly cookie. It does not put `client_id` in save JSON. The JWT's incoming `exp` is preserved, not extended by MotherWrite.
- Subsequent saves require the existing client_id to match the account→user mapping, update the same profile row, accept partial text/image updates, and do not sign a new JWT or set a new cookie. Profile image may be replaced; NID/selfie object keys remain immutable.
- Follow-up version `ff0852ca-40b3-4c15-99f8-cf10fa86809f` (version 13) is active at 100%. Live health is HTTP 200, unauthenticated session is HTTP 401, JWT_PRIVATE_KEY/HYPERDRIVE/KYC_BUCKET remain bound, and no KV binding is present. Authenticated write behavior still has not been production-tested.

## Latest local validation and deployment status

- Worker strict TypeScript check passed.
- Wrangler deploy dry-run passed and showed only expected R2, Hyperdrive, and environment bindings; no KV binding.
- Frontend/server production build passed.
- `git diff --check` passed.
- Deployment completed via the Cloudflare API after Cloudflare MCP's bundle-fetch path returned HTTP 403. The verified Worker version is active at 100%.
- Latest source passed strict Worker TypeScript, Wrangler dry-run, frontend/server build, and `git diff --check`. Authenticated profile/KYC/cookie continuity remains untested.

## Corrected implementation summary

- Context cache is Worker-isolate memory only: 5-minute cache-entry TTL, 500-entry bound, LRU-style insertion-order eviction. This is not the login JWT's validity window. Form fields/files are request-local until the profile save's R2 upload and Neon statement complete.
- Profile save verifies JWT before parsing payload, uploads supplied files to private R2, then uses one parameterized Neon statement to map account → user → profile ID and atomically upsert profile fields plus R2 keys. NID/selfie keys remain immutable once set; profile image is replaceable.
- First successful POST returns `{ ok, profile }` and sets `__Host-mecopay_jwt` with the client_id claim; later updates do not return the ID in JSON or mint/set another token. JWT is never stored in browser storage.
- Deployment is active at version `ff0852ca-40b3-4c15-99f8-cf10fa86809f`, 100%. Live health is 200 and unauthenticated session is 401. No authenticated production write was attempted.
- Correction is pushed to GitHub `main` at commit `a2219ddd9644a5205e46cf3704ed9333aed8c85c`; generated `cloudflare/motherwrite/dist/index.js` is included in the commit.
