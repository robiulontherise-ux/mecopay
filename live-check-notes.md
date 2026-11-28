# MotherWrite live-check notes — 2026-11-28

## Verified production state

- Connected repository: `https://github.com/robiulontherise-ux/mecopay.git`, branch `main`.
- Cloudflare account: `fd4363e9cfebedcb962b3e0c74e113da`.
- Route `mecopay.space/api/mother-write*` → `motherwrite` was created (route ID `3b74cd51f88148d7a8c37bae3f36d07d`).
- The live deployment is still Worker version `2b7057c5-a486-4657-86db-df540583bde7` at 100%, created 2026-11-28 09:21:17 UTC. It is the prior release, not the corrected in-memory-cache/consolidated-save source in this repository.
- Live Worker settings include `ALLOWED_ORIGIN=https://mecopay.space`, `BETTER_AUTH_URL=https://mecopay.space`, Hyperdrive `aa216e60610b4ecd8695f95a8e8a566b`, R2 `mecopay-kyc`, and secret bindings `JWT_PRIVATE_KEY` and `PROBE_TOKEN`. Secret values were not read or exposed.
- The mistakenly created, unbound KV namespace was verified empty and deleted. MotherWrite source and Wrangler config now use only an isolate-local bounded Worker `Map` cache; no KV binding is configured.

## Live HTTP checks (2026-11-28 09:32 UTC)

- `GET https://mecopay.space/api/mother-write` → HTTP 200, JSON health response.
- `GET https://mecopay.space/api/mother-write/session` without credentials → HTTP 401.
- Unauthenticated multipart `POST https://mecopay.space/api/mother-write` → HTTP 401.
- No authenticated profile save, KYC upload, or JWT refresh-continuity test was run; no real production profile data was written.

## Latest local validation and deployment status

- Worker strict TypeScript check passed.
- Wrangler deploy dry-run passed and showed only expected R2, Hyperdrive, and environment bindings; no KV binding.
- Frontend/server production build passed.
- `git diff --check` passed.
- The deployment bundle is reachable from the sandbox (HTTP 200), but Cloudflare MCP execution returns HTTP 403 when fetching the same CDN URL. A multipart upload could not proceed because the connector-side fetch failed. The corrected bundle has **not** been uploaded or activated in production.
- Latest local source passes strict Worker TypeScript, Wrangler dry-run, frontend/server build, and `git diff --check`. The production route still serves the prior version. No authenticated save/KYC/cookie continuity test has been run.

## Corrected implementation summary

- Context cache is Worker-isolate memory only: 5-minute TTL, 500-entry bound, LRU-style insertion-order eviction. Neon remains canonical on cache miss/new isolates. Cached `/session` and `/media` identity/profile resolution avoids repeat Neon reads; private media bytes still come from R2.
- Profile save verifies JWT before parsing payload, uploads supplied files to private R2, then uses one parameterized Neon statement to map account → user → profile ID and atomically upsert profile fields plus R2 keys. NID/selfie keys remain immutable once set; profile image is replaceable.
- Successful POST returns `{ ok, client_id, profile }` and sets refreshed `__Host-mecopay_jwt` HttpOnly cookie. Dashboard validates returned `client_id === profile.id` and keeps it in in-memory UI state; JWT is never stored in browser storage.
- Deployment remains blocked by Cloudflare MCP CDN fetch 403. Latest direct checks at 2026-11-28 10:00 UTC remain GET health 200 and unauthenticated session GET 401; Cloudflare version listing still shows the old version `2b7057c5-a486-4657-86db-df540583bde7` and the expected route. No authenticated production write was attempted.
- Correction is pushed to GitHub `main` at commit `a2219ddd9644a5205e46cf3704ed9333aed8c85c`; generated `cloudflare/motherwrite/dist/index.js` is included in the commit.
