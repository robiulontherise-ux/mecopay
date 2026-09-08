# MecoPay — Cursor Architecture (Final Blueprint)

> **Purpose:** This is the **single source of truth** for MecoPay structure, logic, and execution order. When screenshots or mockups (e.g. ZiniPay) conflict with this file, **this file wins** for menus, panels, and flows. Use reference images for **aesthetic only** — colors, dark theme, card shapes, spacing.

---

## 1. Product Overview

MecoPay is a **hybrid MFS payment gateway and SaaS platform**:

| Role | Description |
|------|-------------|
| **Merchant (Client)** | Configures brand, websites, payment gateways (Personal SMS / Official Merchant API), links, and landing posts via a 3-panel dashboard. |
| **Customer (Payer)** | Pays through public checkout; verified via Android SMS Forwarder (Personal) or direct Official API (Merchant). |
| **Admin** | Platform operator — `ADMIN_EMAIL` gate; sees all clients, fraud reports, and analytics. |

> **Out of Scope (Strictly Forbidden for MVP):** Do NOT generate code for n8n automation workflows or AI Agent Chatbots. Keep the codebase strictly focused on the payment gateway and SaaS platform to prevent hallucinations.

---

## 2. Core Tech Stack & Required Skills

| Layer | Choice |
|-------|--------|
| Frontend & API | Next.js 14+ (App Router), Tailwind CSS (dark default) |
| Backend & DB | Supabase (PostgreSQL, Realtime WebSockets) |
| Auth (Web) | `@supabase/ssr` + **Google OAuth only** |
| Hosting | Cloudflare Pages / Edge Runtime |
| Automation Bridge | Generic Android SMS Forwarder app (Zero-config `.json` config file import) |

---

## 3. Cursor AI Strategy & Execution Workflow

To ship without hallucinations and maintain context, follow the **Feature-by-Feature (Vertical Slicing)** strategy:

1. **Skeleton First:** Build the empty 3-panel dashboard shell first (UI layout only, no functional buttons yet).
2. **One Feature at a Time (Crucial):** DO NOT build all UI buttons at once. Pick ONE feature (e.g., "Create Payment Link"). Build its UI button, immediately write its API route, connect the Supabase logic, and test it. **Finish the feature 100% (UI + Backend Logic) before moving to the next button.**
3. **Micro-prompting:** Never say "Build checkout." Say: *"Create checkout UI with bKash and Nagad buttons using Tailwind. No logic yet."* Then in the next prompt: *"Now connect the bKash button to the checkout API."*
4. **Context management (`@Files`):** Tag only the files you are editing (e.g. `@schema.sql` + `@api/route.ts`).

---

## 4. Zero-Config Android App Connection (HMAC SHA-256)

Clients **never** use a Phone/PIN login for the Android App. Connection is purely config-based:

```
1. Client activates service → unique HMAC-SHA256 Secret + device_id generated in Supabase
2. Client downloads MecoPay Sync APK + custom `mecopay-config.json` file from Apps menu
3. Client imports `.json` file into the app (Click '+' -> IMPORT)
4. Config populates: Webhook URL (?device_id=...), Heartbeat URL, HMAC Secret, JSON payload
5. Webhook sends SMS payload signed with `X-Signature` header (HMAC SHA-256)
```

---

## 5. 14-Day Execution Roadmap (8 Mini-Goals)

| Phase | Days | Goals | Deliverables |
|-------|------|-------|--------------|
| **Foundation** | 1–3 | Auth, DB schema, dashboard shell | Next.js repo, Supabase tables, Google login, static 3-panel layout |
| **Core Logic** | 4–7 | Checkout flow + SMS webhook | Checkout UI (Details → Method → Verify), Edge API to parse SMS JSON with HMAC |
| **Verification** | 8–10 | Live 10-min + 24hr TrxID | Supabase Realtime for 10-min auto-verify; DB query for 24hr manual TrxID lookup |
| **Polish & Deploy** | 11–14 | Smart limits + API Keys | Daily 50k / Monthly 3 Lakh cap, WooCommerce/Personal API Keys, Cloudflare Pages |

---

## 6. Repository Layout

```
mecopay/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/dashboard/page.tsx    # 3-panel workspace
│   ├── blueprint/page.tsx                # Internal architecture reference
│   ├── (public)/
│   │   ├── checkout/[slug]/page.tsx
│   │   └── p/[postSlug]/page.tsx
│   ├── admin/page.tsx
│   ├── profile/page.tsx
│   └── api/
│       ├── heartbeat/route.ts            # 60s Android ping
│       ├── sms-webhook/route.ts          # SMS Forwarder JSON ingest (HMAC verified)
│       └── checkout/route.ts
├── components/
│   ├── left-panel/                       # "Your Mecopay"
│   ├── center-panel/                     # Payments
│   ├── right-panel/                      # "My Site"
│   ├── shared/                           # Paywall blur, Mecopay Secured badge
│   └── checkout/
├── lib/
│   ├── supabase/
│   ├── billing/
│   ├── posts/sanitize.ts
│   └── verification/                     # 10-min realtime + 24hr TrxID logic
├── middleware.ts
└── supabase/migrations/
```

---

## 7. Three-Panel Dashboard Layout

```
┌──────────────────────┬─────────────────────────┬─────────────────────┐
│  LEFT: Your Mecopay  │  CENTER: Payments       │  RIGHT: My Site     │
│  Brand & service     │  Gateway & invoices     │  Posts & landing    │
└──────────────────────┴─────────────────────────┴─────────────────────┘
```

### Strict Left Panel Visual Hierarchy:
1. **Top Left:** MecoPay Logo (Platform branding)
2. **Directly Below:** Client/Merchant Logo (Their specific brand logo)
3. **Below Logos:** The "Your Mecopay" Sidebar Navigation Menu

---

## 8. Auth & Admin Panel

- **Google OAuth only** via Supabase — no email/password signup.
- **Name & Email:** From Google provider (read-only).
- **Phone:** Only manually editable field in Profile.
- `/admin/*` — redirect non-admins to `/dashboard` (`user.email === process.env.ADMIN_EMAIL`).

---

## 9. Left Panel — "Your Mecopay" Navigation

1. Profile  
2. My Service (Plans & Paywall blocker)
3. Website (Brand) — Manage unlimited domains, support info, and redirect links.  
4. Apps / Plugin — **Download Sync APK & Auto-generated `.json` Config File.**  
5. API Setup (MecoPay API & Official MFS Keys).
6. Analytics  

---

## 10. Center Panel & The "Two API" Concepts

### 10.1 Gateway Setup (Verification Logic)
- **Type 1: Personal (Send Money):** Enter personal MFS numbers (`number_1`, `number_2`). Uses SMS Sync App for verification.
- **Type 2: Merchant (Official API):** Enter official MFS/Bank API keys provided by bKash/Nagad. MecoPay system auto-calls these APIs to directly charge the customer (No SMS app needed).

### 10.2 Developer Integration (MecoPay API)
- MecoPay generates a **MecoPay API Key** for the client.
- The client uses this key on their WooCommerce/WordPress site to send product/order details to MecoPay and generate the checkout page dynamically.

### 10.3 Public Checkout Layout & Flow
1. **Header Branding:** Displays **Merchant's Brand Name & Logo** (Not MecoPay logo).
2. **Product Summary:** Price, title, and image.
3. **Customer Form:** Name, Phone, Email.
4. **Payment Verification:**
   - **Personal Account:** 10-min live session countdown OR 24-hr manual TrxID verification.
   - **Merchant API Account:** Direct instant API callback verification.
5. **Footer:** **MecoPay Secured** trust badge + Report button at the bottom.

---

## 11. Payment Routing & Volume Limits (Strict Rules)

| Rule | Value |
|------|-------|
| **Personal Limits** | **Daily: 50,000 TK** per number <br> **Monthly: 300,000 (3 Lakh) TK** per number |
| **Personal Routing** | If `number_1` hits either Daily (50k) OR Monthly (3 Lakh) limit → system automatically routes checkout to `number_2` |
| **Merchant API Limits** | **Unlimited volume.** Bypasses SMS limits entirely. |

---

## 12. Service Plans & Paywall (Billing Engine)

| Plan | Price (Monthly) | Limits & Features |
|------|-----------------|-------------------|
| **Free Trial** | 0 TK | 2-Day limit, 1 Website/Brand, Basic API |
| **Starter** | 100 TK | 1 Website/Brand, Full Gateway Access |
| **Pro** | 200 TK | 2 to 3 Websites/Brands, Premium Support |
| **Business** | 500 TK | Unlimited Websites, Links, **Custom Domain Support** |

---

## 13. Database Schema (Logical)

Every client table: `user_id UUID NOT NULL REFERENCES auth.users(id)` + RLS.

| Table | Purpose |
|-------|---------|
| `profiles` | `phone`, `plan_type`, `plan_expires_at` |
| `websites` | Brand profiles, support info, redirect links (JSON) |
| `mecopay_api_keys` | Keys given TO clients to connect WooCommerce/Custom sites |
| `official_mfs_keys`| Encrypted Official MFS keys provided BY bKash/Nagad to clients (Type 2) |
| `payment_numbers` | `number_1`, `number_2`, volume counters, account type |
| `invoices` | `status`, `gateway_number`, `trx_id`, amount, product details |
| `sms_events` | Raw parsed SMS from webhook (for TrxID matching) |
| `device_configs` | `device_id`, `hmac_secret`, `last_heartbeat_at`, `connected` |
| `posts` | `slug`, `content_json`, `website_id`, `published` |

---

## 13. Bengali Summary (ফুল সিস্টেম সারাংশ)

১. **Auth:** শুধু Google Login।
২. **App Config (HMAC SHA-256):** ক্লায়েন্ট `mecopay-config.json` ফাইল ডাউনলোড করে অ্যাপে ইম্পোর্ট করলেই ওয়েবহুক, হার্টবিট এবং HMAC Secret কী সেট হয়ে যাবে। কোনো PIN লাগবে না।
৩. **API System (2 Types):**
   - *MecoPay API:* ক্লায়েন্টকে দেওয়া হবে যাতে সে তার নিজস্ব ওয়েবসাইটে (যেমন: WooCommerce) পেমেন্ট লিংক জেনারেট করতে পারে।
   - *Official MFS API:* ক্লায়েন্ট যদি কর্পোরেট অ্যাকাউন্ট ব্যবহার করে, তবে সে বিকাশ/নগদ থেকে পাওয়া API key ড্যাশবোর্ডে বসাবে। এতে SMS App ছাড়াই পেমেন্ট ভেরিফাই হবে।
৪. **Checkout Branding:** পেমেন্ট পেজের উপরে মার্চেন্টের নিজস্ব ব্র্যান্ড নাম ও লোগো থাকবে, কাস্টমার ফর্ম থাকবে এবং নিচে "MecoPay Secured" ব্যাজ থাকবে।
৫. **Limit:** পার্সোনাল নাম্বারে দৈনিক ৫০ হাজার ও মাসে ৩ লাখ টাকা লিমিট ফুল হলে অটোমেটিক ২য় নাম্বারে পেমেন্ট যাবে। Official Merchant API-তে কোনো লিমিট নেই।
৬. **Cursor Workflow:** সব বাটন একসাথে না বানিয়ে প্রতিবার একটি করে ফিচারের UI + Backend লজিক ১০০% কমপ্লিট করে পরের ফিচারে যেতে হবে।
