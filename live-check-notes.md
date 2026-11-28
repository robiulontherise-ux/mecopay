Live read-only checks, 2026-11-28:

- Connected GitHub repository: https://github.com/robiulontherise-ux/mecopay.git, branch main.
- Cloudflare account: fd4363e9cfebedcb962b3e0c74e113da.
- Live Worker `motherwrite` currently contains only a 369-byte probe script returning `ok`; it has no profile route, JWT guard, R2 upload, Neon query, cookie update, or client_id handling.
- Live `motherwrite` bindings: HYPERDRIVE -> mecopayneonhyperdrive, KYC_BUCKET -> mecopay-kyc, PROBE_TOKEN secret, JWT_PRIVATE_KEY secret.
- Live Hyperdrive `mecopayneonhyperdrive`: Neon host ep-small-cake-bagarfq6-pooler.c-8.eu-central-1.aws.neon.tech, db neondb, user neondb_owner; credentials not stored here.
- Live R2 buckets: email-files, mecopay-kyc (created 2026-11-28), mecopay-media.
- Live Worker domains: cname.mecopay.space -> gatewayworker. No live Worker route matching `/api/mother-write` was returned for zone mecopay.space.
- Public probe: GET https://mecopay.space/api/mother-write returns SPA HTML (HTTP 200), not a Worker API response. GET /api/auth/tenant/session returns JSON null.
- Repository frontend: src/components/DashboardShell.tsx still directly reads/writes Supabase profiles and uploads to Supabase kyc_documents; it contains birth_number, birth_cert_url, age_group, birth certificate UI, reset logic, and admin preview.
- Repository has no MotherWrite Worker source or wrangler config for it; only Cloudflare authworker patch scripts and old extracted project config.
- Prior audit notes: auth Worker live source has JWT/HYPERDRIVE/profile/account logic; current queued login provisioning path must be treated carefully. No production changes made yet.
