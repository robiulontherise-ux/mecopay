# MecoPay Telegram Login

## Flow

1. `/login` থেকে **Telegram** নির্বাচন করলে `/telegram-login` পেজ খুলবে। ব্যবহারকারী **Create Telegram login link** চাপলে browser `POST /api/auth/telegram/request-link` করে। Worker signed, HttpOnly flow-cookie দেয় এবং Durable Object `OTP_STORE`-এ 5 মিনিটের challenge রাখে।
2. Worker bot-এর `t.me` deep link তৈরি করে। Browser সেটি নতুন tab-এ খোলে; ব্যবহারকারী `MecoPay_Authentication_bot`-এ **Start** চাপেন।
3. Telegram webhook `POST /api/auth/telegram/webhook`-এ update পাঠায়। Worker derived webhook secret যাচাই করে, one-time start payload consume করে এবং challenge-এ Telegram user ID-এর confirmation 5 মিনিটের বাকি TTL-সহ রাখে। Bot ব্যবহারকারীকে browser-এ ফিরে **Verify and sign in** চাপতে বলে।
4. Browser-এর Verify button `POST /api/auth/telegram/verify` করে। Worker challenge, browser flow-cookie এবং expiry মিলিয়ে দেখে; confirmation না এলে `pending` ফেরত দেয়—কোনো polling হয় না।
5. Confirmation মিললে Worker challenge একবার consume করে Better Auth session তৈরি করে। Telegram-এর internal email sign-in session/cookie তৈরির জন্যই থাকে; তার session hook provisioning event পাঠায় না। Worker verified Telegram identity persist করে, একবার login payload তৈরি করে এবং একই সময়ে পাঁচ মিনিটের ES256 JWT sign করে। তারপর Sub-Worker/Queue-তে payload একবার পাঠায়। Queue accepted হওয়ার পর একই pre-signed JWT JSON response ও Secure, HttpOnly cookie-তে browser-কে ফেরত যায়; এই flow `/api/auth/session-token`-এ আরেকটি provisioning event পাঠায় না। Dashboard-এর Better Auth session cookie-ই মূল session।

## Google ও Email-এর single-event handoff

- Google callback এবং Email OTP/password verification সফল হয়ে Better Auth session তৈরি হলে session-create hook একবারই common login-provision function চালায়। ভুল/মেয়াদোত্তীর্ণ OTP বা ব্যর্থ OAuth callback-এ payload বা JWT তৈরি/পাঠানো হয় না।
- Worker Queue পাঠানোর আগেই event payload ও JWT claims তৈরি করে এবং JWT sign করে। Sub-Worker accepted না বললে browser-কে সফল login response দেওয়া হয় না; accepted হলে একই JWT `__Host-mecopay_jwt` Secure, HttpOnly, SameSite=Lax cookie-তে ফেরত যায়। Google callback redirect হলেও token URL-এ যায় না।
- `/api/auth/session-token` compatibility token response দিতে পারে, কিন্তু Queue event পাঠায় না। পুরোনো manual `/api/auth/provision` route duplicate event ঠেকাতে retired (`410`).

## Limits and security

- Challenge পাঁচ মিনিট পর মেয়াদোত্তীর্ণ হয় এবং একবারই ব্যবহারযোগ্য।
- Signed browser flow-cookie অনুযায়ী পাঁচ মিনিটে সর্বোচ্চ দুইটি link/request; Telegram user ID অনুযায়ীও পাঁচ মিনিটে সর্বোচ্চ দুইটি Start confirmation অনুমোদিত। Cookie reset করে abuse ঠেকাতে Cloudflare client IP-তে 10 request/5-minute guard আছে। Resend করলে আগের active challenge বাতিল হয়।
- Verification user-initiated; WebSocket বা background polling নেই। Link token random, browser-visible challenge ID-এর সঙ্গে আলাদা, আর Worker storage-এ link token-এর hash থাকে।
- Telegram API bot token বা JWT browser code-এ রাখা হয় না। JWT পাঁচ মিনিটে মেয়াদোত্তীর্ণ; Better Auth-এর HttpOnly cookie dashboard gate-এর মূল session।
- Telegram কোনো verified email দেয় না। তাই নতুন Telegram identity `telegram-<id>@users.invalid` synthetic email-সহ আলাদা MecoPay user হিসেবে তৈরি হয়; Google/Email account-এর সঙ্গে স্বয়ংক্রিয় merge/link হয় না। একই ব্যক্তি existing account-এ Telegram যুক্ত করতে চাইলে পরে explicit account-linking flow দরকার হবে।

## Deployment

`cloudflare/authworker/deploy-telegram-login.py` বর্তমান `authworker` bundle পড়ে fragment-টি duplicate না করে যোগ করে, Cloudflare settings response-এর deployable fields preserve করে এবং `TELEGRAM_BOT_USERNAME` যোগ করে। Dry-run default; script live Worker source/settings পড়ে এবং Node পাওয়া গেলে syntax check করে, কিন্তু upload করে না। Production Worker deploy-এর জন্য `CLOUDFLARE_API_TOKEN` ও `CLOUDFLARE_ACCOUNT_ID` environment-এ দিয়ে `--deploy` চালাতে হয়। Telegram webhook বদলাতে অতিরিক্ত `--set-webhook` flag লাগে; script ভিন্ন existing webhook পেলে সেটি স্বয়ংক্রিয়ভাবে overwrite করে না।
