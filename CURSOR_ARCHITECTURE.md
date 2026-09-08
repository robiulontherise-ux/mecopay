# MecoPay - Full System Architecture & Blueprint

## 🇧🇩 বাংলা ব্রেকডাউন (Bengali Full Architecture)

### ১. অথেনটিকেশন এবং অ্যাডমিন প্যানেল (Security & Auth)
* **Strict Google Login:** সিস্টেমে কোনো পাসওয়ার্ড বা ম্যানুয়াল সাইন-আপ ফর্ম থাকবে না। শুধুমাত্র Supabase Google OAuth ব্যবহার করে লগিন করতে হবে। এতে 2-Step Verification গুগলের মাধ্যমেই হ্যান্ডেল হবে। 
* **Profile Setup:** লগিন করার পর ইউজার শুধু তার Phone Number অ্যাড করতে পারবে। Name এবং Email গুগল থেকেই অটো-ফেচ হবে এবং ফিক্সড থাকবে।
* **Admin Routing:** সিস্টেমে একটি নির্দিষ্ট `ADMIN_EMAIL` থাকবে। যদি লগিন করা ইমেইলটি এর সাথে মিলে যায়, তবেই সে অ্যাডমিন প্যানেলে ঢুকতে পারবে।
* **Admin Powers:** অ্যাডমিন প্যানেল থেকে সমস্ত ক্লায়েন্টের ট্রানজেকশন, মান্থলি/ডেইলি গ্রাফ, সবচেয়ে বেশি সেল করা ক্লায়েন্টদের লিস্ট এবং পেমেন্ট পেজের "Mecopay Secured" ব্যাজ থেকে আসা ফ্রড/রিপোর্টগুলো ম্যানেজ করা যাবে। নতুন কাস্টম পেমেন্ট গেটওয়ে ডিজাইনও অ্যাডমিন এখান থেকে অ্যাড করবে।

### ২. লেফট প্যানেল: "Your Mecopay" (Brand & Service Management)
এই প্যানেলে মোট ৬টি মেনু থাকবে: Profile, My Service, Website (Brand), Apps/Plugin, Merchant, এবং Analytics।
* **My Service (Billing Engine):** নতুন ইউজার আসলে সার্ভিসে ২টা অপশন দেখাবে: `1-Day Free Test` (সিস্টেম চেক করার জন্য) এবং `Pro Plan (100 TK/Month)`। সার্ভিস অ্যাক্টিভ না থাকলে Website, Payment বা Apps কোনোকিছুই কাজ করবে না (ZiniPay এর মত ব্লার পপআপ আসবে)। প্রো প্ল্যানে লিমিট থাকবে ১ নাম্বারে মাসে সর্বোচ্চ ৩ লাখ টাকা এবং পার্সোনাল অ্যাকাউন্টে সর্বোচ্চ ২টি নাম্বার। এর বেশি লিমিট লাগলে Merchant মেনু থেকে TIN/Trade License দিয়ে আপগ্রেড করতে হবে।
* **Website (Brand):** ক্লায়েন্ট আনলিমিটেড "Website/Brand" বানাতে পারবে। প্রতিটির আন্ডারে Brand Logo, Support Info (WhatsApp/Email) এবং **আনলিমিটেড রিডাইরেক্ট লিংক** (Telegram, Tally, Drive ইত্যাদি) অ্যাড করা যাবে।
* **Apps/Plugin:** সার্ভিস অ্যাক্টিভ থাকলে এখান থেকে ক্লায়েন্ট ২টি ফাইল ডাউনলোড করবে (SMS Forwarder APK এবং কাস্টম .json Config File)। এই ফাইলগুলো ডাটাবেসে সেভ থাকবে। কোনো লগিন বা পিনের দরকার নেই, শুধু অ্যাপে ঢুকে .json ফাইলটি ইম্পোর্ট করলেই হবে। সার্ভিস অফ থাকলে এটি ব্লক (paywall) থাকবে।
* **Analytics:** Recharts ব্যবহার করে Today's Transaction, Monthly এবং Brand-wise ট্রানজেকশনের গ্রাফ দেখাবে।

### ৩. সেন্টার প্যানেল: "Payments" (Heartbeat & Invoicing)
এই প্যানেলে পেমেন্ট গেটওয়ে, লিংক তৈরি এবং ইনভয়েস ম্যানেজ হবে।
* **View Gateways & Payment Limits:** ক্লায়েন্ট যেকোনো "Website" সিলেক্ট করে তার আন্ডারে পেমেন্ট গেটওয়ে (bKash, Nagad) বসাবে। প্রো প্ল্যানে একটি নাম্বারে মাসে সর্বোচ্চ ৩ লাখ টাকার লিমিট থাকবে এবং সর্বোচ্চ ২টি পার্সোনাল নাম্বার অ্যাড করা যাবে। প্রথম নাম্বারের লিমিট শেষ হলে সিস্টেম অটোমেটিক পেমেন্ট দ্বিতীয় নাম্বারে শিফট (Route) করে দিবে। এর চেয়ে বেশি ট্রানজেকশন লিমিট লাগলে Merchant অ্যাকাউন্টে আপগ্রেড করতে হবে।
* **Payment Links:** পেমেন্ট লিংক বানানোর সময় Product Name, Product Image, Price সেট করবে এবং ওই Website-এর আন্ডারে থাকা আনলিমিটেড রিডাইরেক্ট লিংকগুলো থেকে **যেকোনো ১টি** লিংক সিলেক্ট করে দিবে।
* **The Heartbeat System (Core):** কাস্টমার যখন পেমেন্ট লিংকে গিয়ে "Buy" এ ক্লিক করে ফর্ম (Name, Email, Phone) সাবমিট করবে, তখন Supabase চেক করবে ওই ক্লায়েন্টের Android SMS App অনলাইনে আছে কি না (যা প্রতি ৬০ সেকেন্ডে পিং পাঠায়)। 
* **Automated Config Import (No Coding for Clients):** ক্লায়েন্টদের কোনো কোডিং বা কনফিগারেশনের দরকার নেই। আপনি (অ্যাডমিন) Android Studio দিয়ে ওপেন-সোর্স অ্যাপটির নাম "MecoPay Sync" এবং লোগো পরিবর্তন করে একটি APK বানিয়ে রাখবেন (কোনো লজিক চেঞ্জ করতে হবে না)। ক্লায়েন্ট ড্যাশবোর্ড থেকে সার্ভিস কিনলে ২টি জিনিস ডাউনলোড করবে: আপনার বানানো MecoPay Sync অ্যাপ এবং একটি কাস্টম Config File (.json)। অ্যাপে ঢুকে '+' আইকনে ক্লিক করে ফাইলটি ইম্পোর্ট করলেই কাজ শেষ! এই ফাইলে HMAC-SHA256 সিক্রেট কি থাকে, ফলে প্রজেক্ট URL লিক হলেও কেউ ফেক ডেটা পাঠাতে পারবে না।
* **Offline Fallback:** যদি অ্যাপ অনলাইনে (Alive) থাকে, তবে Auto Verify (Option 1) অন থাকবে। যদি অফলাইন থাকে, তবে Auto Verify ব্লক হয়ে যাবে এবং কাস্টমারকে TrxID (Option 2) দিয়ে ম্যানুয়াল পেমেন্ট করতে বলবে। তখন ক্লায়েন্ট অনলাইনে আসলে তাকে ইমেইলে জানানো হবে।
* **Leads & Invoices:** কাস্টমার ফর্ম সাবমিট করলেই তা `Pending (Leads)` এ চলে আসবে। কাস্টমার পেমেন্ট কনফার্ম করলে তা `Completed` এ যাবে। শুধুমাত্র Completed পেমেন্টের উপর ভিত্তি করে MecoPay-এর মান্থলি ট্রানজেকশন ফি ক্যালকুলেট হবে। Cancel বা Fraud হওয়া ইনভয়েস ডিলিট করা যাবে।

### ৪. রাইট প্যানেল: "My Site" (Landing Page & Post Builder)
* **Subdomain / Custom Domain:** ক্লায়েন্ট লেফট প্যানেলে বানানো Website-এর আন্ডারে ল্যান্ডিং পেজ বানাতে পারবে। 
* **Post Constraints:** আনলিমিটেড পোস্ট করা যাবে, কিন্তু ডিরেক্ট ভিডিও আপলোড করা যাবে না। শুধুমাত্র YouTube বা Rumble-এর ভিডিও এম্বেড করা যাবে। 
* **Strict Links:** পোস্টে বাইরের কোনো লিংক অ্যালাউড না। শুধুমাত্র "Mecopay Payment Link" বাটন আকারে অ্যাড করা যাবে (যেখানে আসল প্রাইস এবং ডিসকাউন্ট প্রাইস দেখানো যাবে)। সার্ভিস বন্ধ থাকলে বা মেয়াদ শেষ হলে এই ওয়েবসাইট বা পেমেন্ট পেজ কাজ করবে না।

### ৫. টেক স্ট্যাক এবং ইনফ্রাস্ট্রাকচার (Tech Stack)
* **Cloudflare Edge:** সিস্টেমের স্পিড এবং সিকিউরিটির জন্য React SPA-টি Cloudflare Pages-এ হোস্ট করা হবে।
* **Database & BaaS:** Supabase ব্যবহার করা হবে Auth, Database, এবং Realtime Heartbeat ট্র্যাকিংয়ের জন্য। 
* **Security:** Supabase RLS (Row Level Security) কড়াভাবে মেইনটেইন করতে হবে এবং HMAC-SHA256 সিকিউরিটি থাকবে যাতে এক ক্লায়েন্ট অন্য ক্লায়েন্টের ডেটা দেখতে না পারে এবং ফেক ডেটা ইনসার্ট না হয়।

---

## 🇬🇧 English Breakdown (For Cursor AI Prompting)

### 1. Authentication & Admin Panel (Security & Auth)
* **Strict Google Login:** No email/password sign-up forms. Authentication is strictly handled via Supabase Google OAuth. 2-Step Verification is naturally inherited from Google.
* **Profile Setup:** Upon login, users can only add their Phone Number. Name and Email are auto-fetched from Google and remain fixed/read-only.
* **Admin Routing:** The system checks against a fixed `ADMIN_EMAIL`. If there is a match, the user is routed to a protected Admin Panel.
* **Admin Powers:** The admin can view all client data, total transactions, daily/monthly revenue graphs, top-selling clients, and manage "Fraud Reports" originating from the "Mecopay Secured" badge on payment pages. Admins can also inject new Custom Payment Gateway designs.

### 2. Left Panel: "Your Mecopay" (Brand & Service Management)
This panel features a 6-item sidebar: Profile, My Service, Website (Brand), Apps/Plugin, Merchant, and Analytics.
* **My Service (Billing Engine):** New users see two options: `1-Day Free Test` or `Pro Plan (100 TK/Month)`. If no active service exists, core features (Websites, Payments, Apps) are locked behind a professional blur-overlay modal (inspired by ZiniPay). The Pro plan limits personal numbers to 3 Lakh TK/month and max 2 numbers. Higher volumes require upgrading via the Merchant tab (TIN/Trade License submission).
* **Website (Brand):** Clients can create unlimited "Websites/Brands". For each brand, they configure a Logo, Support Info (WhatsApp/Email), and **Unlimited Redirect Links** (e.g., Telegram, Tally, Drive).
* **Apps/Plugin:** When the service is active, clients can download 2 files directly from here: the MecoPay Sync APK and their custom `.json` Config File. These files are securely hosted in the backend. No Phone+PIN login is needed—the client simply opens the app and imports the config file. If the service is expired, this section is locked behind a paywall.
* **Analytics:** Recharts-powered graphs showing Today's Transaction, Monthly trends, and Brand-wise transaction distributions.

### 3. Center Panel: "Payments" (Heartbeat & Invoicing)
Handles gateways, links, and customer invoicing.
* **View Gateways & Payment Limits:** Clients assign their personal numbers (e.g., bKash, Nagad) to a "Website". A single personal number has a strict monthly limit of 3 Lakh TK, and clients can add a maximum of 2 numbers. If the first number hits its limit, the system auto-routes incoming payments to the second number. Exceeding this total volume requires a Merchant upgrade.
* **Payment Links:** When generating a payment link, clients set Product Name, Image, Price, and select **exactly ONE** redirect link (from the unlimited list configured in their Website brand).
* **The Heartbeat System (Core):** When a customer clicks "Buy" and submits the Name/Email/Phone form, Supabase checks if the client's Android SMS App is online (it pings every 60 seconds).
* **Automated Config Import (No Coding for Clients):** The Android App DOES NOT need custom logic coding. As an admin, you only open Android Studio ONCE to change the name to "MecoPay Sync" and update the logo, then export the APK. Clients download this MecoPay Sync App and a custom Config File (.json). They simply open the app, click the '+' icon, and import the config file. Security is handled natively via an HMAC-SHA256 secret in the config—preventing spoofing even if the Supabase URL/Key is exposed.
* **Offline Fallback:** If Alive: Auto Verify (Option 1) is enabled. If Offline: Auto Verify is blocked, the user is forced to use Option 2 (Manual TrxID), and the client receives an offline alert. Once the client is back online, they are notified via email to verify the pending payment.
* **Leads & Invoices:** Submitted customer forms land in `Pending (Leads)`. Once verified, they move to `Completed` (this calculates MecoPay's dynamic transaction fee bill). Cancelled/Fraud invoices can be deleted.

### 4. Right Panel: "My Site" (Landing Page & Post Builder)
* **Domain Management:** Clients build landing pages tied to their Left-panel "Website" brands. Served on subdomains (with custom domain mapping support).
* **Post Constraints:** Clients can create unlimited posts but direct video uploads are disabled. Only YouTube or Rumble video embeds are permitted.
* **Strict Links:** External links are strictly forbidden in the post builder. Clients can ONLY embed "Mecopay Payment Link" buttons (supporting strike-through pricing). If the client's service expires, the site and payment links go offline.

### 5. Tech Stack & Infrastructure
* **React SPA & Cloudflare Pages:** The web dashboard is built as a single-page React application hosted on Cloudflare Pages.
* **Database & BaaS:** Supabase handles Google OAuth, Database, and real-time Heartbeat state tracking.
* **Supabase Security:** Strict Supabase RLS (Row Level Security) combined with HMAC-SHA256 secrets in the app configuration ensure that clients can only query their own data, and only the authorized app instance can insert SMS data.
