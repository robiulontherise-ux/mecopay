# No-code custom-domain login flow

## কী বদলানো হয়েছে

No-code storefront-এর visitor login path Mother dashboard login থেকে আলাদা। Mother site-এ Google button `/api/auth/google/start` ব্যবহার করে। No-code storefront-এর Google button এখন নিজের বর্তমান host-এ top-level navigation করে:

```text
/api/auth/tenant/start?provider=google&returnTo=<বর্তমান path, query ও hash>
```

এটি `fetch` নয়। Browser-এর পুরো navigation হওয়ায় Google OAuth এবং cross-domain handoff-এর cookies ঠিক origin-এ সেট হয়।

## End-to-end flow

1. Visitor no-code custom domain বা MecoPay subdomain-এ Google login বেছে নেয়। `src/mysite/lib/authWorker.ts` বর্তমান URL-কে `returnTo` হিসেবে encode করে tenant-start URL তৈরি করে। Navbar-এর সরাসরি Google button এবং login modal—দুটিই এই helper ব্যবহার করে।
2. Gateway Worker KV থেকে domain metadata নেয়। Mother site-এর service-active guard skip হয়। অন্য host-এর ক্ষেত্রে active/registered domain এবং service metadata যাচাই হয়; Auth Worker-এ `/api/auth/*` route কেবল Mother বা `app_type: no_code` host-এর জন্য। Custom/WordPress site Auth Worker-এ পাঠানো হয় না।
3. Auth Worker tenant origin ও safe relative return path-সহ অল্প-মেয়াদি transaction Neon-এর `mecopay_auth.auth_handoff` table-এ রাখে। তারপর browser-কে Mother origin-এ tenant continuation endpoint-এ পাঠায়।
4. Mother origin-এ Better Auth Google OAuth শুরু করে। Google callback fixed Mother URL `https://mecopay.space/api/auth/callback/google`-এ আসে; Better Auth user/account/session Neon-এ লেখে।
5. Worker callback session যাচাই করে one-use handoff তৈরি করে এবং visitor-কে তার আগের no-code origin-এ ফিরিয়ে দেয়। Handoff code hash হিসেবে রাখা হয়; transferred session-cookie value table-এ encrypted থাকে।
6. No-code origin-এর consume endpoint handoff একবার consume করে সেই host-এর জন্য Secure, HttpOnly session cookie সেট করে এবং visitor-কে `returnTo`-তে পাঠায়।
7. No-code app `/api/auth/get-session` দিয়ে Worker session পড়ে। Sign-out `/api/auth/sign-out`-এ POST করে।

## Frontend code entry points

- `src/components/WebsiteBuilderHub.tsx`: My Sites-এর no-code view থেকে `src/mysite/App.tsx`-এ প্রবেশ।
- `src/mysite/components/Navbar.tsx`: storefront-এর সরাসরি Google button ও logout।
- `src/mysite/components/LazyAuthModal.tsx`: modal-এর Google button।
- `src/mysite/App.tsx`: modal render এবং Auth Worker session bootstrap।
- `src/mysite/lib/authWorker.ts`: tenant start, get-session ও sign-out helper।

## সীমা ও পরবর্তী migration

এই পরিবর্তনটি no-code storefront-এর Google login/session/logout-কে Auth Worker-এ নেয়। Business/profile, orders, customer portal এবং অন্যান্য website data এখনও Supabase query করতে পারে। Auth Worker cookie Supabase Auth JWT নয়; তাই Supabase RLS-protected data access-কে Worker session হিসেবে ধরে নেওয়া যাবে না। Profile auto-provisioning, API key/web-secret generation এবং business data migration এই login patch-এ অন্তর্ভুক্ত নয়.

Login UI-তে Google provider-ই expose করা আছে. Facebook/GitHub use করতে provider credentials, UI controls, consent settings, and end-to-end verification separately complete করতে হবে.

## Verification

- `src/mysite`-এর login/session/logout code-এ `supabase.auth.*` call-site grep audit: none found.
- No-code app source-এ `/api/auth/tenant/start`, `/api/auth/get-session`, `/api/auth/sign-out` routes found.
- TypeScript lint and production build completed successfully using installed dependencies without changing `package-lock.json`.
- Live Google account round-trip/custom-domain cookie handoff has not yet been executed as part of this repository change.
