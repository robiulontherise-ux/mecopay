# MecoPay Telegram Login

## Flow

1. `/login` থেকে **Telegram** নির্বাচন করলে `/telegram-login` পেজ খুলবে। ব্যবহারকারী **Create Telegram login link** চাপলে browser `POST /api/auth/telegram/request-link` করে। Worker signed, HttpOnly flow-cookie দেয় এবং Durable Object `OTP_STORE`-এ 5 মিনিটের challenge রাখে।
2. Worker bot-এর `t.me` deep link তৈরি করে। Browser সেটি নতুন tab-এ খোলে; ব্যবহারকারী `MecoPay_Authentication_bot`-এ **Start** চাপেন।
3. Telegram webhook `POST /api/auth/telegram/webhook`-এ update পাঠায়। Worker derived webhook secret যাচাই করে, one-time start payload consume করে এবং challenge-এ Telegram user ID-এর confirmation 5 মিনিটের বাকি TTL-সহ রাখে। Bot ব্যবহারকারীকে browser-এ ফিরে **Verify and sign in** চাপতে বলে।
4. Browser-এর Verify button `POST /api/auth/telegram/verify` করে। Worker challenge, browser flow-cookie এবং expiry মিলিয়ে দেখে; confirmation না এলে `pending` ফেরত দেয়—কোনো polling হয় না।
5. Confirmation মিললে Worker challenge একবার consume করে Better Auth session তৈরি করে, existing profile provisioning-এ `telegram` provider ব্যবহার করে এবং বর্তমান `/api/auth/session-token` route দিয়ে পাঁচ মিনিটের ES256 JWT browser-কে ফেরত দেয়। Dashboard-এর মূল session HttpOnly cookie-তে থাকে; বর্তমান app কোনো JavaScript-readable storage-এ bearer JWT সংরক্ষণ করে না।

## Limits and security

- Challenge পাঁচ মিনিট পর মেয়াদোত্তীর্ণ হয় এবং একবারই ব্যবহারযোগ্য।
- Signed browser flow-cookie অনুযায়ী পাঁচ মিনিটে সর্বোচ্চ দুইটি link/request; Telegram user ID অনুযায়ীও পাঁচ মিনিটে সর্বোচ্চ দুইটি Start confirmation অনুমোদিত। Cookie reset করে abuse ঠেকাতে Cloudflare client IP-তে 10 request/5-minute guard আছে। Resend করলে আগের active challenge বাতিল হয়।
- Verification user-initiated; WebSocket বা background polling নেই। Link token random, browser-visible challenge ID-এর সঙ্গে আলাদা, আর Worker storage-এ link token-এর hash থাকে।
- Telegram API bot token বা JWT browser code-এ রাখা হয় না। JWT পাঁচ মিনিটে মেয়াদোত্তীর্ণ; Better Auth-এর HttpOnly cookie dashboard gate-এর মূল session।
- Telegram কোনো verified email দেয় না। তাই নতুন Telegram identity `telegram-<id>@users.invalid` synthetic email-সহ আলাদা MecoPay user হিসেবে তৈরি হয়; Google/Email account-এর সঙ্গে স্বয়ংক্রিয় merge/link হয় না। একই ব্যক্তি existing account-এ Telegram যুক্ত করতে চাইলে পরে explicit account-linking flow দরকার হবে।

## Deployment

`cloudflare/authworker/deploy-telegram-login.py` বর্তমান `authworker` bundle পড়ে fragment-টি duplicate না করে যোগ করে, Cloudflare settings response-এর deployable fields preserve করে এবং `TELEGRAM_BOT_USERNAME` যোগ করে। Dry-run default; script live Worker source/settings পড়ে এবং Node পাওয়া গেলে syntax check করে, কিন্তু upload করে না। Production Worker deploy-এর জন্য `CLOUDFLARE_API_TOKEN` ও `CLOUDFLARE_ACCOUNT_ID` environment-এ দিয়ে `--deploy` চালাতে হয়। Telegram webhook বদলাতে অতিরিক্ত `--set-webhook` flag লাগে; script ভিন্ন existing webhook পেলে সেটি স্বয়ংক্রিয়ভাবে overwrite করে না।
