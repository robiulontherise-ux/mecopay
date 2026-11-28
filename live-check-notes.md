# MotherWrite live-check notes — 2026-11-28

## Verified production state

- Connected repository: `https://github.com/robiulontherise-ux/mecopay.git`, branch `main`.
- Cloudflare account: `fd4363e9cfebedcb962b3e0c74e113da`.
- Route `mecopay.space/api/mother-write*` → `motherwrite` was created (route ID `3b74cd51f88148d7a8c37bae3f36d07d`).
- The live deployment is still Worker version `2b7057c5-a486-4657-86db-df540583bde7` at 100%, created 2026-11-28 09:21:17 UTC. It is the prior release, not the latest context-cache/query/cleanup source currently in this repository.
- Live Worker settings include `ALLOWED_ORIGIN=https://mecopay.space`, `BETTER_AUTH_URL=https://mecopay.space`, Hyperdrive `aa216e60610b4ecd8695f95a8e8a566b`, R2 `mecopay-kyc`, and secret bindings `JWT_PRIVATE_KEY` and `PROBE_TOKEN`. Secret values were not read or exposed.
- The dedicated `MOTHERWRITE_CONTEXT` KV namespace exists (ID `8b82bdd5739f49c4bb563bb1535932c1`) but is not yet bound in live Worker settings.

## Live HTTP checks (2026-11-28 09:32 UTC)

- `GET https://mecopay.space/api/mother-write` → HTTP 200, JSON health response.
- `GET https://mecopay.space/api/mother-write/session` without credentials → HTTP 401.
- Unauthenticated multipart `POST https://mecopay.space/api/mother-write` → HTTP 401.
- No authenticated profile save, KYC upload, or JWT refresh-continuity test was run; no real production profile data was written.

## Latest local validation and deployment status

- Worker strict TypeScript check passed.
- Wrangler deploy dry-run passed and showed expected KV, R2, Hyperdrive, and environment bindings for the candidate bundle.
- Frontend/server production build passed.
- `git diff --check` passed.
- Wrangler's authenticated deployment flow previously stopped at an OAuth prompt timeout. A Cloudflare API multipart upload path was identified, but the connector could not retrieve the temporary sandbox/CDN bundle URL (HTTP 403). Therefore the current local Worker bundle and KV binding have **not** been uploaded/activated in production.
- Until that upload is completed, the production route continues to serve the previous deployed version. The exact source change is present locally and must not be reported as deployed.
