import React from 'react';
import { Calendar, Code2, Database, Layout, ShieldCheck, Zap, Rocket, CheckCircle2, AlertTriangle, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Blueprint() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* Blog Header */}
        <header className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm mb-6">
            <Rocket className="w-4 h-4" /> Final Architecture Blueprint
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            The 14-Day SaaS Execution Plan
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            A comprehensive, step-by-step guide to building a scalable MFS Payment Gateway using Next.js, Supabase, and Cursor AI. Zero hallucinations, 100% professional execution.
          </p>
        </header>

        {/* Section: Tech Stack & Skills */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Code2 className="w-6 h-6 text-indigo-500" />
            1. Core Tech Stack & Required Skills
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">Tech Stack</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> <strong>Frontend & API:</strong> React (Vite/SPA), Tailwind CSS</li>
                <li className="flex items-start gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> <strong>Backend & DB:</strong> Supabase (PostgreSQL, WebSockets)</li>
                <li className="flex items-start gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> <strong>Hosting:</strong> Cloudflare Pages (Free, Scalable SPA Hosting)</li>
                <li className="flex items-start gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> <strong>Automation Bridge:</strong> Android SMS Forwarder</li>
              </ul>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">What You Need to Know (Skills)</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> Basic React (Vite) Component Structure</li>
                <li className="flex items-start gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> Relational Database Logic (Tables, Rows, Relations)</li>
                <li className="flex items-start gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> How APIs work (Request/Response)</li>
                <li className="flex items-start gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> <strong>Prompt Engineering:</strong> Breaking down logic for Cursor</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section: Cursor AI Strategy */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-500" />
            2. Cursor AI 14-Day Free Trial Strategy
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p className="mb-4">
              The free trial gives you 14 days of premium fast requests (Claude 3.5 Sonnet / GPT-4o). To complete the project within this limit without errors or hallucinations:
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <strong className="text-slate-800 block">Micro-Prompting (Anti-Hallucination)</strong>
                  Never say "Build the checkout page". Say: "Create a UI component for the checkout page with two buttons (bKash, Nagad) using Tailwind. Do not add logic yet." Combine logic only after UI is perfect.
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <strong className="text-slate-800 block">Context Management (Cmd+K / @Files)</strong>
                  Only tag the specific files you are working on. If you are fixing a DB error, only tag `@schema.ts` and `@api/route.ts`. Giving Cursor too many files causes hallucinations.
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <strong className="text-slate-800 block">Step-by-Step Verification</strong>
                  Test every single goal before moving to the next. If the UI breaks, tell Cursor exactly what the error message in the terminal says.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Zero-Config Client Onboarding (The Genius Architecture) */}
        <section className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl shadow-xl border border-indigo-800 p-8 md:p-10 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Zap className="w-48 h-48" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
            <Rocket className="w-6 h-6 text-indigo-400" />
            2.5 Zero-Config Automated App Connection (The Genius Architecture)
          </h2>
          <div className="relative z-10">
            <p className="text-indigo-100 mb-6 text-lg">
              Clients <strong>DO NOT</strong> need to configure complex URLs or Keys in the App. The system generates a ready-to-use configuration file for the MecoPay Sync App.
            </p>
            <div className="grid sm:grid-cols-4 gap-4 text-sm relative">
              {/* Flow Arrows for Desktop */}
              <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-indigo-500/30 -translate-y-1/2 z-0"></div>
              
              <div className="bg-indigo-950/80 border border-indigo-500/30 p-4 rounded-xl relative z-10 text-center">
                <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3 font-bold border border-indigo-500/50">1</div>
                <strong className="block text-white mb-1">Buy Service</strong>
                <p className="text-indigo-200 text-xs">Client purchases the Pro/Free service plan, unlocking the App configuration tools.</p>
              </div>
              <div className="bg-indigo-950/80 border border-indigo-500/30 p-4 rounded-xl relative z-10 text-center">
                <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3 font-bold border border-indigo-500/50">2</div>
                <strong className="block text-white mb-1">Download 2 Files</strong>
                <p className="text-indigo-200 text-xs">Client downloads the MecoPay Sync App (APK) and their unique Customized Config File (.json) from the dashboard.</p>
              </div>
              <div className="bg-indigo-950/80 border border-indigo-500/30 p-4 rounded-xl relative z-10 text-center">
                <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3 font-bold border border-indigo-500/50">3</div>
                <strong className="block text-white mb-1">Import Config</strong>
                <p className="text-indigo-200 text-xs">Client installs the App, grants SMS permissions, clicks the '+' icon, and imports the downloaded Config File.</p>
              </div>
              <div className="bg-indigo-950/80 border border-indigo-500/30 p-4 rounded-xl relative z-10 text-center">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 font-bold border border-emerald-500/50">4</div>
                <strong className="block text-emerald-300 mb-1">Secure Sync</strong>
                <p className="text-indigo-200 text-xs">The config contains a secure HMAC-SHA256 secret. Nobody can send fake data even if they know your Project URL or Anon Key. Supabase RLS protects everything.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: 14-Day Timeline (The 8 Goals) */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-emerald-500" />
            3. The 14-Day Execution Roadmap (8 Mini-Goals)
          </h2>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            
            {/* Phase 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-emerald-500 text-emerald-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Database className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-emerald-600">Days 1-3: Foundation</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Goal 1 & 2: Auth, DB Schema & Dashboard UI</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Set up React (Vite) repo. Connect to Supabase. Write prompt for Auth UI. Define Tables (users, numbers, transactions). Build the static Dashboard layout.
                </p>
                <div className="text-xs bg-slate-100 p-2 rounded text-slate-600 font-mono">Prompt Target: "React Supabase Auth UI", "Tailwind Dashboard layout"</div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-blue-500 text-blue-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Layout className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-600">Days 4-7: Core Logic</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Goal 3 & 4: Checkout Flow & Direct DB Inserts</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Build the Checkout UI (Details -&gt; Method -&gt; Verify Option). Connect the Android App DIRECTLY to Supabase. The App will write SMS and Heartbeat data directly to DB using secure RLS.
                </p>
                <div className="text-xs bg-slate-100 p-2 rounded text-slate-600 font-mono">Prompt Target: "Supabase RLS policies for direct Android App data insertion"</div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-purple-500 text-purple-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Zap className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-purple-600">Days 8-10: Verification Engines</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Goal 5 & 6: Live 10-Min & 24hr TrxID</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Implement Supabase Realtime (WebSockets) for the 10-min auto-verify. Implement standard database query for the 24hr manual TrxID verification.
                </p>
                <div className="text-xs bg-slate-100 p-2 rounded text-slate-600 font-mono">Prompt Target: "Supabase Realtime channel subscription in React"</div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-orange-500 text-orange-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-orange-600">Days 11-14: Polish & Deploy</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Goal 7 & 8: Smart Limits & Cloudflare</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Implement Smart Routing (if Number A &gt; 25k, show Number B). Generate embeddable HTML Button Links. Connect GitHub to Cloudflare Pages for free deployment.
                </p>
                <div className="text-xs bg-slate-100 p-2 rounded text-slate-600 font-mono">Prompt Target: "React dynamic payment link generator"</div>
              </div>
            </div>

          </div>
        </section>

        {/* NEW SECTION: Deep Architectural Analysis & Execution Plan */}
        <section className="bg-slate-900 rounded-3xl shadow-xl border border-slate-700 p-8 md:p-10 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Layout className="w-8 h-8 text-blue-400" />
            4. ফুল সিস্টেম আর্কিটেকচার এবং ডিপ অ্যানালাইসিস (বাংলা)
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Cursor AI এর জন্য এটি হলো ফুল প্রজেক্ট স্ট্রাকচার। এখানে অ্যাডমিন, প্রোফাইল, সার্ভিস, লেফট প্যানেল (Your Mecopay), সেন্টার প্যানেল (Payments), এবং রাইট প্যানেল (My Site) এর বিস্তারিত ব্রেকডাউন দেওয়া হলো।
          </p>

          <div className="space-y-8">
            {/* Phase 1: Auth & Admin */}
            <div className="border-l-4 border-red-500 pl-6 relative">
              <div className="absolute w-4 h-4 bg-red-500 rounded-full -left-[10px] top-1"></div>
              <h3 className="text-2xl font-bold text-white mb-2">১. Auth এবং Admin Panel (Security First)</h3>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li><strong>One-Time Biometric & Google Login (WebAuthn Passkey via Supabase):</strong> 
                  <ul className="list-circle pl-5 mt-1 space-y-1 text-slate-300">
                    <li><strong>1-Time Onboarding Enrollment:</strong> প্রথমবার Google Account দিয়ে সাইনআপ করার সময় সিস্টেমে ১ বার ডিভাইসের <strong>Biometric Fingerprint / Face ID</strong> প্রোভাইড করতে হবে। এরপর প্রতিবার লগিনে বারবার আঙুলের ছাপ দিতে হবে না, সরাসরি সেভড সেশন ও গুগল লগিনে এক্সেস মিলবে।</li>
                    <li><strong>Laptop QR-Scan Biometric Support:</strong> ল্যাপটপ/পিসিতে ফিঙ্গারপ্রিন্ট সেন্সর না থাকলে অনবোর্ডিংয়ের সময় সিকিউর <strong>QR Code</strong> স্ক্যান করে মোবাইলের ফিঙ্গারপ্রিন্ট দিয়ে ১ সেকেন্ডে ১ বারের জন্য রেজিস্ট্রেশন সম্পন্ন করা যাবে।</li>
                    <li><strong>Anti-Multi-Account Lock (Same Fingerprint = Duplicate Blocked):</strong> বায়োমেট্রিকের অনন্য WebAuthn Credential ID / Public Key হ্যাশ Supabase ডাটাবেসে চিরতরে সেভ থাকবে। ১ ব্যক্তি যদি অন্য আরেকটি Google Account দিয়ে ২য় একাউন্ট খোলার চেষ্টা করে, সিস্টেম সাথে সাথে বায়োমেট্রিক আইডি ম্যাচ করে ২য় একাউন্ট ব্লক (Rejected) করে দেবে!</li>
                  </ul>
                </li>
                <li><strong>Admin Routing:</strong> নির্দিষ্ট অ্যাডমিন ইমেইল দিয়ে লগিন করলেই শুধুমাত্র অ্যাডমিন প্যানেল ওপেন হবে। অন্য কেউ এটি দেখতে পাবে না (2-Step Verification বাধ্যতামূলক)।</li>
                <li><strong>Admin Powers:</strong> অ্যাডমিন সব ক্লায়েন্ট ডেটা, টোটাল ট্রানজেকশন, মান্থলি/ডেইলি গ্রাফ, কোন ক্লায়েন্ট সবচেয়ে বেশি পেমেন্ট নিচ্ছে, এবং ফ্রড রিপোর্ট (Mecopay Secured ব্যাজ থেকে আসা) দেখতে ও ম্যানেজ করতে পারবে।</li>
              </ul>
            </div>

            {/* Phase 2: Profile & Service */}
            <div className="border-l-4 border-emerald-500 pl-6 relative">
              <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -left-[10px] top-1"></div>
              <h3 className="text-2xl font-bold text-white mb-2">২. Profile এবং Business Type Selection (3 Plans Model)</h3>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li><strong>Business Type Selection:</strong> ক্লায়েন্ট সার্ভিস নেওয়ার সময় ৩টি বিজনেস মোডের ১টি সিলেক্ট করবে:
                  <ul className="list-circle pl-5 mt-1 space-y-1 text-slate-400">
                    <li><strong className="text-emerald-400">১. Digital Product Plan:</strong> শুধুমাত্র ১০০% ফুল অনলাইন পেমেন্ট (Course, Ebook, Software)। পেমেন্ট ভেরিফাই হলে অটো ডিজিটাল ডেলিভারি/রিডাইরেক্ট হবে।</li>
                    <li><strong className="text-blue-400">২. E-Commerce Plan:</strong> ফিজিক্যাল প্রোডাক্টের জন্য। ৩টি পেমেন্ট লিংক অপশন সাপোর্ট করবে: <em>Full Advance Payment</em>, <em>Partial Advance (যেমন: ১০০-২০০ টাকা ডেলিভারি চার্জ অ্যাডভান্স)</em>, অথবা <em>0 Advance COD Order Tracking</em>।</li>
                    <li><strong className="text-purple-400">৩. Hybrid Plan:</strong> যারা ডিজিটাল এবং ই-কমার্স ২ ধরনের বিজনেসই একসাথে পরিচালনা করে।</li>
                  </ul>
                </li>
                <li><strong>Advance & Order Tracking System:</strong> কাস্টমার ১০০ টাকা অ্যাডভান্স পেমেন্ট করলে MecoPay SMS App সেন্ট ট্রানজেকশন ম্যাচ করে "Advance Paid - Confirmed" স্ট্যাটাস দিবে এবং সাকসেস ফর্মে রিডাইরেক্ট করবে। প্লাগিন/ওয়েবহুক মারফত সাইটে অর্ডার কনফার্ম হবে।</li>
                <li><strong>Order Return & Cancel Management:</strong> কাস্টমার যদি ডেলিভারি নেওয়ার আগে প্রোডাক্ট ক্যানসেল বা রিটার্ন করে, মার্চেন্ট MecoPay প্যানেল থেকে অর্ডার "Cancelled/Returned" মার্ক করবে। ফলে MecoPay ওই অর্ডারের হিসেব সামঞ্জস্য করবে।</li>
                <li><strong>Fraud Warning & Account Suspension:</strong> মার্চেন্ট প্যানেলে স্পষ্ট ওয়ার্নিং থাকবে: <em>"যেকোনো ফেক ট্রানজেকশন, জালিয়াতি বা ফেক অর্ডার এন্ট্রি ধরা পড়লে সার্ভিস তাৎক্ষণিক সাসপেন্ড করা হবে এবং কোনো রিফান্ড দেওয়া হবে না।"</em></li>
              </ul>
            </div>

            {/* Phase 3: Left Side */}
            <div className="border-l-4 border-blue-500 pl-6 relative">
              <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[10px] top-1"></div>
              <h3 className="text-2xl font-bold text-white mb-2">৩. Left Panel: "Your Mecopay" (Brand Config)</h3>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li><strong>Navigation:</strong> লেফট সাইডবারে থাকবে Profile, My Service, Website (Brand), Apps/Plugin, Merchant, এবং Analytics.</li>
                <li><strong>Website (Brand):</strong> ক্লায়েন্ট আনলিমিটেড "Website" বা ব্র্যান্ড প্রোফাইল বানাতে পারবে। প্রতিটির আন্ডারে কাস্টমার সাপোর্টের জন্য ইমেইল/ফোন নাম্বার, লোগো এবং আনলিমিটেড রিডাইরেক্ট লিংক (Tally, G-Drive) সেট করা যাবে।</li>
                <li><strong>Apps/Plugin:</strong> এখান থেকে ক্লায়েন্ট SMS Forwarder App বা প্লাগিন ডাউনলোড করে কানেক্ট করবে (Google Auth দিয়ে)। সার্ভিস অন না থাকলে এটি কাজ করবে না।</li>
              </ul>
            </div>

            {/* Phase 4: Center Payment Flow */}
            <div className="border-l-4 border-purple-500 pl-6 relative">
              <div className="absolute w-4 h-4 bg-purple-500 rounded-full -left-[10px] top-1"></div>
              <h3 className="text-2xl font-bold text-white mb-2">৪. Center Panel: Payments & Direct App Connect</h3>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li><strong>Gateway Setup:</strong> ক্লায়েন্ট Website সিলেক্ট করে "View Gateway" তে গিয়ে পেমেন্ট মেথড (bKash, Nagad) সিলেক্ট করে তাদের পার্সোনাল নাম্বার বসাবে। অ্যাডমিন প্যানেল থেকে নতুন কাস্টম গেটওয়ে ডিজাইন অ্যাড করা যাবে।</li>
                <li><strong>Create Link:</strong> পেমেন্ট লিংক বানানোর সময় Product Name, Image, Price এবং নির্দিষ্ট Website এর আন্ডার থেকে ১টি রিডাইরেক্ট লিংক সিলেক্ট করতে হবে।</li>
                <li><strong>Webhook Sync (Zero Android Code for Clients):</strong> মোবাইল অ্যাপে ক্লায়েন্টকে কোনো লগিন করতে বা URL বসাতে হবে না। সার্ভিস কিনলে ক্লায়েন্ট MecoPay Sync অ্যাপ এবং একটি কাস্টম Config File (.json) ডাউনলোড করবে। অ্যাপে ঢুকে '+' আইকনে ক্লিক করে ফাইলটি ইম্পোর্ট করলেই কাজ শেষ! এই ফাইলে HMAC-SHA256 সিক্রেট কি এবং Supabase প্রজেক্ট URL থাকবে, ফলে কেউ চাইলেও ফেক ডেটা পাঠাতে পারবে না।</li>
                <li><strong>External Custom Website Security & Return Flow:</strong>
                  <ul className="list-circle pl-5 mt-1 space-y-1 text-slate-400">
                    <li>বাইরের যেকোনো কাস্টম ওয়েবসাইট MecoPay API Key & Signed Webhook ব্যবহার করবে।</li>
                    <li><strong>Read-Only & Action Guard:</strong> বাইরের ওয়েবসাইট শুধুমাত্র পেমент ইনিশিয়েট ও স্ট্যাটাস চেক করতে পারবে। তারা MecoPay-এর ডাটাবেসে অর্ডার ক্যানসেল বা এডিট করতে পারবে না।</li>
                    <li><strong>Digital vs Physical Product Rule for Custom Sites:</strong>
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-300">
                        <li><strong>Digital Products:</strong> কোনো শর্ত নেই! বাইরের কাস্টম ওয়েবসাইটে কোর্স, সফটওয়্যার বা সার্ভিস বিক্রি করতে MecoPay / Tazapay API অবাধে ব্যবহার করা যাবে।</li>
                        <li><strong>Physical Products (Mandatory Delivery API):</strong> বাইরের কাস্টম ওয়েবসাইটে ফিজিক্যাল প্রোডাক্টের ফুল পেমেন্ট প্রসেস করতে হলে মার্চেন্টকে বাধ্যতামূলক কুরিয়ার/ডেলিভারি API (Steadfast, Pathao, RedX ইত্যাদি) কানেক্ট করতে হবে। কুরিয়ার API না থাকলে কাস্টম সাইটে শুধুমাত্র <strong>COD Advance Charge (১০০-২০০ টাকা)</strong> ফর্ম দিয়ে পেমেন্ট নেওয়া যাবে। কাস্টম সাইট ছাড়া ফুল ফিজিক্যাল প্রোডাক্ট শপ করতে হলে MecoPay-এর নিজস্ব Website Builder এ বানাতে হবে।</li>
                      </ul>
                    </li>
                    <li><strong>3 Solutions for Order Return / Cancellation:</strong>
                      <ol className="list-decimal pl-5 space-y-1 text-slate-300 mt-1">
                        <li><strong>Merchant Incentive & Auto-Default Rule:</strong> কাস্টমার রিটার্ন দিলে মার্চেন্ট যদি MecoPay প্যানেলে আপডেট না করে, তবে MecoPay সিস্টেম উক্ত অর্ডারকে <em>"Successfully Delivered & Completed"</em> হিসেবে গণ্য করবে এবং সেটির ওপর সার্ভিস ফি চার্জ করবে। ফলে মার্চেন্টের নিজের ফি বাঁচানোর স্বার্থেই তাকে রিটার্ন মার্ক করতে হবে।</li>
                        <li><strong>Courier API Auto-Sync (Local & Global Cross-Border):</strong> লোকাল ই-কমার্সের জন্য Steadfast / Pathao / RedX এবং গ্লোবাল ক্রসবর্ডার শিপিংয়ের জন্য AfterShip / DHL / FedEx / Aramex / ShipRocket API কানেক্ট রাখা যাবে। পার্সেল "Returned" বা "Delivered" হওয়ার সাথে সাথে MecoPay অটোমেটিক স্ট্যাটাস ট্র্যাক করে ভলিউম ফি অ্যাডজাস্ট করবে।</li>
                        <li><strong>Anti-Fraud & Zero-Friction Return Protocol:</strong>
                      <div className="bg-slate-900/90 border border-amber-500/30 p-4 rounded-lg mt-2 space-y-2 text-xs leading-relaxed text-slate-300">
                        <p className="font-semibold text-amber-400 text-sm mb-1">মার্চেন্টের কাজের ঝামেলা (Manual Friction) এবং ফ্রড ঠেকানোর সমাধান:</p>
                        <ol className="list-decimal pl-4 space-y-2">
                          <li><strong className="text-white">Courier API Direct Auto-Sync (0% Manual Effort - Local & Global):</strong> মার্চেন্ট সেটিংস থেকে লোকাল কুরিয়ার (Steadfast, Pathao, RedX) বা গ্লোবাল শিপিং সার্ভিস (DHL, FedEx, AfterShip) এর API Key কানেক্ট করবে। কুরিয়ারে পার্সেল "Returned" বা "Delivered" হলে কুরিয়ার MecoPay-কে অটোমেটিক Webhook সংকেত পাঠাবে। ১টি আইডি ম্যানুয়ালি লেখার ঝামেলাও থাকবে না!</li>
                          <li><strong className="text-white">Bulk CSV/Excel Upload (1-Click for 100+ Returns):</strong> যাদের API নেই বা কাস্টম ওয়েবসাইট ব্যবহার করে, তারা কুরিয়ার প্যানেল থেকে দৈনিক ডেলিভারি রিাপোর্ট (Excel) ডাউনলোড করে MecoPay-তে ১ ক্লিকে আপলোড দেবে। MecoPay একসাথে ১০০টি রিটার্ন ১ সেকেন্ডে আপডেট করবে।</li>
                          <li><strong className="text-white">COD Advance Fee Exemption Rule:</strong> ই-কমার্স COD অর্ডারে কাস্টমার যে ১০০-২০০ টাকা অ্যাডভান্স পেমেন্ট করে (যা MecoPay দিয়ে প্রসেস হয়), তা কিন্তু কুরিয়ার চার্জ হিসেবে খরচ হয়ে যায়। MecoPay শুধুমাত্র ওই প্রসেসকৃত ১০০ টাকার ওপর ১% ফি নিবে। প্রোডাক্ট রিটার্ন আসলেও ওই ১০০ টাকা অ্যাডভান্স অলরেডি সংগৃহীত ও ব্যবহূত, তাই সেটি রিটার্ন মারার বিন্দুমাত্র ঝামেলাই নেই!</li>
                          <li><strong className="text-white">Anomaly Detection & Ban Protection:</strong> কোনো মার্চেন্ট যদি বাল্ক আপলোডে ভুয়া রিটার্ন দিয়ে MecoPay-এর ফি ফাঁকি দেওয়ার চেষ্টা করে, AI অ্যানোমালি ডিটেক্টর অটোমেটিক রিটার্ন রেট ৩০%+ হলে একাউন্ট ফ্ল্যাগ করবে এবং কুরিয়ার প্রুফ না দিতে পারলে একাউন্ট স্থায়ীভাবে সাসপেন্ড করা হবে।</li>
                        </ol>
                      </div>
                    </li>
                      </ol>
                    </li>
                  </ul>
                </li>
                <li><strong>App Access Control:</strong> শুধুমাত্র যাদের অ্যাক্টিভ সার্ভিস (Pro/Free) থাকবে, তারাই ওয়েবসাইট থেকে Secret Webhook URL জেনারেট করতে পারবে। সার্ভিস অফ থাকলে API কোনো SMS রিসিভ করবে না।</li>
                <li><strong>Offline Handling:</strong> অ্যাপ অফলাইন থাকলে অটো-ভেরিফাই ব্লক হবে। কাস্টমারকে অপশন ২ (Send Money + TrxID) ব্যবহার করতে বলা হবে এবং ক্লায়েন্ট অনলাইনে আসলে ইমেইলে নোটিফিকেশন যাবে।</li>
                <li><strong>Invoice & Leads:</strong> কাস্টমার ফর্ম পূরণ করলেই তা "Pending/Leads" এ জমা হবে। পেমেন্ট কনফার্ম হলে "Complete" এ যাবে, যেখান থেকে Mecopay এর বিল ক্যালকুলেট হবে। Cancel/Fraud হওয়া ইনভয়েস ডিলিট করা যাবে। প্রতিটি পেমেন্ট পেজে "Mecopay Secured" ব্যাজ এবং রিপোর্ট বাটন থাকবে।</li>
              </ul>
            </div>

            {/* Phase 5: Right Side */}
            <div className="border-l-4 border-orange-500 pl-6 relative">
              <div className="absolute w-4 h-4 bg-orange-500 rounded-full -left-[10px] top-1"></div>
              <h3 className="text-2xl font-bold text-white mb-2">৫. Right Panel: "My Site" (Post & Landing Builder)</h3>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li><strong>Subdomain & Custom Domain:</strong> ক্লায়েন্টরা লেফট প্যানেলে বানানো Website-এর আন্ডারে ল্যান্ডিং পেজ বা সাইট বানাতে পারবে (Mecopay সাবডোমেইন বা কাস্টম ডোমেইন দিয়ে)।</li>
                <li><strong>Post & Embeds:</strong> তারা আনলিমিটেড পোস্ট করতে পারবে। পোস্টে নরমাল টেক্সট/ইমেজ এবং YouTube/Rumble এর ভিডিও এম্বেড করা যাবে (ডিরেক্ট ভিডিও আপলোড বন্ধ)।</li>
                <li><strong>Strict Buttons:</strong> বাইরের কোনো লিংক দেওয়া কঠোরভাবে নিষেধ। পোস্টে শুধুমাত্র Mecopay Payment Link (Buy Button) ব্যবহার করা যাবে, যেখানে ক্রস-আউট প্রাইস ও ফাইনাল প্রাইস দেখানো যাবে। সার্ভিস অফ থাকলে ওয়েবসাইট কাজ করবে না।</li>
              </ul>
            </div>

            {/* Phase 6: Tech & Cloudflare */}
            <div className="border-l-4 border-pink-500 pl-6 relative">
              <div className="absolute w-4 h-4 bg-pink-500 rounded-full -left-[10px] top-1"></div>
              <h3 className="text-2xl font-bold text-white mb-2">৬. Edge Runtime & Database (Tech Stack)</h3>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li><strong>Cloudflare & Supabase Edge:</strong> Frontend চলবে Cloudflare Pages এ (React SPA হিসেবে), এবং ডেটাবেস/রিয়েলটাইম চলবে Supabase এ, ফলে সার্ভার ডাউন হওয়ার কোনো ভয় নেই।</li>
                <li><strong>Supabase Track:</strong> সার্ভিসের মেয়াদ শেষ হওয়া, ফ্রি-ট্রায়ালের টাইম লিমিট এবং Heartbeat পিং - সবকিছু রিয়েলটাইমে Supabase ম্যানেজ করবে।</li>
              </ul>
            </div>

            {/* Phase 7: Cursor Workflow vs Human Tasks */}
            <div className="border-l-4 border-cyan-500 pl-6 relative">
              <div className="absolute w-4 h-4 bg-cyan-500 rounded-full -left-[10px] top-1"></div>
              <h3 className="text-2xl font-bold text-white mb-2">৭. Workflow: Cursor যা করবে vs আপনি যা করবেন</h3>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li><strong>Cursor যা করবে (Code & Config):</strong> Cursor আপনার জন্য React (Vite) এর পুরো কোড, UI ডিজাইন, `@supabase/supabase-js` সেটআপ এবং ডাটাবেস টেবিল বানানোর জন্য <strong>SQL স্ক্রিপ্ট</strong> লিখে দিবে।</li>
                <li><strong>আপনাকে যা করতে হবে (Manual Setup):</strong>
                  <ul className="list-circle pl-5 mt-2 space-y-1">
                    <li>Supabase ওয়েবসাইটে গিয়ে প্রজেক্ট খুলতে হবে এবং API Key নিয়ে Cursor কে দিতে হবে (.env ফাইলে বসানোর জন্য)।</li>
                    <li>Cursor যে <strong>SQL Code</strong> দিবে, তা কপি করে Supabase এর SQL Editor-এ রান করে টেবিল বানাতে হবে।</li>
                    <li>Google Cloud Console-এ গিয়ে OAuth সেটআপ করে Client ID ও Secret Supabase-এ বসাতে হবে (লগিনের জন্য)।</li>
                    <li>কাজ শেষে Cloudflare Pages/Workers এ প্রজেক্ট আপলোড করে ডোমেইন কানেক্ট করতে হবে।</li>
                  </ul>
                </li>
              </ul>
            </div>

            {/* Phase 8: UI/UX & Cursor Image Prompting */}
            <div className="border-l-4 border-yellow-500 pl-6 relative">
              <div className="absolute w-4 h-4 bg-yellow-500 rounded-full -left-[10px] top-1"></div>
              <h3 className="text-2xl font-bold text-white mb-2">৮. UI/UX ডিজাইন এবং Cursor প্রম্পটিং স্ট্র্যাটেজি</h3>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li><strong>Image vs Text:</strong> Cursor-কে প্রম্পট দেওয়ার সময় MecoPay বা অন্য কোনো রেফারেন্স <strong>ইমেজ</strong> দিবেন শুধুমাত্র কালার, ডার্ক থিম, এবং কার্ডের লুক বোঝানোর জন্য। কিন্তু মেনু স্ট্রাকচার বা লজিকের জন্য <strong>সবসময় টেক্সট প্রম্পট</strong> ব্যবহার করবেন, যাতে Cursor আপনার কাস্টম লজিক (6-menu structure) ব্রেক না করে।</li>
                <li><strong>Profile UI:</strong> ম্যানুয়াল ফর্ম বা পাসওয়ার্ড ফিল্ড থাকবে না। Profile-এ Google থেকে পাওয়া Email (Fixed) ও Name থাকবে। ক্লায়েন্ট শুধু Phone Number অ্যাড করতে পারবে।</li>
                <li><strong>Website (Brand) Modal:</strong> MecoPay এর Add Brand-এর মতো একটি সুন্দর পপআপ বা ফর্ম থাকবে যেখানে Logo, Name, Support Info এবং <strong>Unlimited Redirect Links</strong> অ্যাড করার অপশন থাকবে।</li>
                <li><strong>Service Popups:</strong> ইউজারের সার্ভিস অ্যাক্টিভ না থাকলে "Plan কিনে সার্ভিস চালু করুন" টাইপ একটি প্রফেশনাল ব্লার-ওভারলে পপআপ আসবে (MecoPay এর মতো), যেখানে 1-Day Free Test এবং 100 TK Pro Plan থাকবে।</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section: Database Schema & WebAuthn Technical Flow */}
        <section className="bg-slate-900 text-white rounded-3xl shadow-xl border border-slate-800 p-8 md:p-10 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-emerald-400">
            <Database className="w-6 h-6 text-emerald-400" />
            4. Supabase Universal Database Schema & Biometric Flow (Next.js)
          </h2>
          
          <div className="space-y-6 text-sm text-slate-300">
            {/* Subsection 1: WebAuthn Integration */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-mono">FLOW</span>
                Next.js + Supabase Google Auth ➔ 1-Time Biometric Registration Step-by-Step
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-slate-300">
                <li><strong>Step 1 (Google OAuth Login):</strong> ইউজার "Sign in with Google" এ ক্লিক করলে Supabase Auth standard OAuth সম্পন্ন করবে (<code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">supabase.auth.signInWithOAuth({`{ provider: 'google' }`})</code>)।</li>
                <li><strong>Step 2 (Onboarding Check):</strong> লগিনের পর Next.js Middleware/Page চেক করবে <code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">user_biometrics</code> টেবিলে উক্ত <code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">user_id</code>-এর কোনো রেকর্ড আছে কিনা। রেকর্ড না থাকলে অটোমেটিক <code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">/onboarding/biometric</code> পেজে পাঠাবে।</li>
                <li><strong>Step 3 (Browser Native Passkey Prompt):</strong> ফ্রন্টএন্ড থেকে Browser WebAuthn API (<code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">navigator.credentials.create()</code>) ট্রিগার হবে। ইউজার তার মোবাইল/ডিভাইসের Fingerprint বা Face ID স্ক্যান করবে (ল্যাপটপে সেন্সর না থাকলে অন-স্ক্রিন QR Code মোবাইলে স্ক্যান করবে)।</li>
                <li><strong>Step 4 (Save Credential ID in Supabase):</strong> উৎপন্ন হওয়া অনন্য <code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">credential_id</code> ও Public Key হ্যাশ Supabase <code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">user_biometrics</code> টেবিলে সেভ হবে।</li>
                <li><strong>Step 5 (Anti-Multi-Account Lock):</strong> <code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">user_biometrics</code> টেবিলের <code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">credential_id</code> কলামটিতে <strong>UNIQUE Constraint</strong> দেওয়া থাকবে। একই ব্যক্তি যদি ২য় কোনো গুগল একাউন্ট দিয়ে নতুন একাউন্ট খুলতে চায়, একই আঙুলের ছাপ দেওয়া মাত্র PostgreSQL Unique Violation Error মারবে এবং একাউন্ট সাথে সাথে ব্লক করে দেবে!</li>
              </ol>
            </div>

            {/* Subsection 2: Total 6 Core Tables */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded font-mono">SCHEMA</span>
                Universal Database Schema (Total 6 Core Tables for Global & Local Operations)
              </h3>
              <p className="text-xs text-slate-400 mb-3">দেশ ভিত্তিক আলাদা টেবিল করার কোনো প্রয়োজন নেই! ১টি ইউনিভার্সাল ডেটাবেস স্কিমাই UUID, <code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">country_code</code> ও <code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">currency</code> কলাম দিয়ে বিশ্বের সব দেশের ক্লায়েন্ট ও ট্রানজেকশন হ্যান্ডেল করবে।</p>
              
              <div className="grid md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="text-emerald-400 font-bold text-sm block mb-1">1. profiles</span>
                  <p className="text-slate-400">id (UUID, PK)</p>
                  <p className="text-slate-400">email (TEXT, Unique)</p>
                  <p className="text-slate-400">full_name (TEXT)</p>
                  <p className="text-slate-400">country_code (TEXT - 'BD', 'US', 'IN')</p>
                  <p className="text-slate-400">currency (TEXT - 'BDT', 'USD', 'EUR')</p>
                  <p className="text-slate-400">role (TEXT - 'admin' | 'client')</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="text-blue-400 font-bold text-sm block mb-1">2. user_biometrics</span>
                  <p className="text-slate-400">id (UUID, PK)</p>
                  <p className="text-slate-400">user_id (UUID, FK -&gt; profiles.id)</p>
                  <p className="text-amber-300 font-bold">credential_id (TEXT, UNIQUE)</p>
                  <p className="text-slate-400">public_key (TEXT)</p>
                  <p className="text-slate-400">device_name (TEXT)</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="text-purple-400 font-bold text-sm block mb-1">3. merchants</span>
                  <p className="text-slate-400">id (UUID, PK)</p>
                  <p className="text-slate-400">user_id (UUID, FK -&gt; profiles.id)</p>
                  <p className="text-slate-400">brand_name (TEXT)</p>
                  <p className="text-slate-400">plan_type ('digital' | 'ecommerce')</p>
                  <p className="text-slate-400">tazapay_account_id (TEXT)</p>
                  <p className="text-slate-400">courier_api_keys (JSONB)</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="text-amber-400 font-bold text-sm block mb-1">4. transactions</span>
                  <p className="text-slate-400">id (UUID, PK)</p>
                  <p className="text-slate-400">merchant_id (UUID, FK)</p>
                  <p className="text-slate-400">amount (DECIMAL), currency (TEXT)</p>
                  <p className="text-slate-400">payment_method ('mfs' | 'card' | 'bank')</p>
                  <p className="text-slate-400">gateway_provider ('local' | 'tazapay')</p>
                  <p className="text-slate-400">status ('pending'|'completed'|'returned')</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="text-rose-400 font-bold text-sm block mb-1">5. courier_sync_logs</span>
                  <p className="text-slate-400">id (UUID, PK)</p>
                  <p className="text-slate-400">transaction_id (UUID, FK)</p>
                  <p className="text-slate-400">courier_name ('Steadfast'|'Pathao'|'RedX')</p>
                  <p className="text-slate-400">consignment_id (TEXT)</p>
                  <p className="text-slate-400">delivery_status ('Delivered'|'Returned')</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="text-cyan-400 font-bold text-sm block mb-1">6. payouts</span>
                  <p className="text-slate-400">id (UUID, PK)</p>
                  <p className="text-slate-400">merchant_id (UUID, FK)</p>
                  <p className="text-slate-400">amount (DECIMAL), currency (TEXT)</p>
                  <p className="text-slate-400">payout_method ('local_mfs' | 'bank')</p>
                  <p className="text-slate-400">status ('pending' | 'processed')</p>
                </div>
              </div>
            </div>

            {/* Subsection 3: Geo-IP Dynamic Payment & VPN Protocol */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-mono">GEO-IP & SECURITY</span>
                Geo-IP Dynamic Payment UI & VPN/Incognito Protection Protocol
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-300 text-xs">
                <li><strong>How Geo-IP Detects Country & Local Gateways:</strong> Cloudflare Edge Server প্রতিটি ইনকামিং রিকোয়েস্টের <code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300">CF-IPCountry</code> হেডার রিড করে। Tazapay SDK বা Hosted Checkout API এই Country Code (যেমন: BD, IN, SG, US) অনুযায়ী কাস্টমারের দেশের লোকাল MFS (bKash/Nagad), UPI/NetBanking, PayNow বা Card মেথডগুলো স্ক্রিনে অটোমেটিক সাজিয়ে দেখায়।</li>
                <li><strong>Dynamic Gateway for MecoPay & Client Custom Websites:</strong>
                  <ul className="list-circle pl-5 mt-1 space-y-1 text-slate-400">
                    <li><strong>MecoPay Platform Sales:</strong> বিশ্বের যেকোনো দেশের ছোট/বড় ক্লায়েন্ট MecoPay-এর সার্ভিস কেনার সময় তাদের দেশের পেমেন্ট মেথড দেখতে পাবে।</li>
                    <li><strong>Client Custom Websites:</strong> MecoPay-তে হোস্ট করা বা কাস্টম ওয়েবসাইটে আসা কাস্টমাররা Tazapay Checkout Widget-এর মাধ্যমে তাদের নিজস্ব দেশের MFS/Bank/Card দেখতে পাবে।</li>
                  </ul>
                </li>
                <li><strong>VPN, Incognito & Proxy Handling Protocol:</strong>
                  <ul className="list-circle pl-5 mt-1 space-y-1 text-slate-400">
                    <li><strong>Manual Country Dropdown (Fallback Selector):</strong> কোনো কাস্টমার VPN চালু করে (যেমন বাংলাদেশ থেকে US VPN অন করে) ঢুকলে, Tazapay Checkout উইজেটের উপরে আপনার তৈরি করা <strong>"Your Country [ Dropdown ]"</strong> দেখতে পাবে। সে "Bangladesh" সিলেক্ট করলেই সাথে সাথে স্ক্রিনে বিকাশ/নগদ চলে আসবে!</li>
                    <li><strong>Risk-Scoring & 3DS / OTP Mandatory Verification:</strong> VPN ব্যবহার করলেও পেমেন্ট সম্পন্ন করতে কাস্টমারের নিজের MFS বা ব্যাংকের OTP ভেরিফিকেশন (3D Secure) বাধ্যতামূলক। মোবাইল ব্যাংকিং বা পিন ছাড়া পেমেন্ট সাকসেসফুল হবে না।</li>
                    <li><strong>Currency Auto-Settlement:</strong> কাস্টমার তার দেশের লোকাল কারেন্সিতে (BDT, INR, EUR) পে করবে, আর Tazapay তা কনভার্ট করে MecoPay বা মার্চেন্টের অ্যাকাউন্টে সেটেল করবে।</li>
                  </ul>
                </li>
              </ul>
            </div>

            {/* Subsection 4: MecoPay Master Control Dashboard vs Tazapay Banking Rails */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded font-mono">ARCHITECTURE</span>
                White-Label Checkout UI Flow: Client Branding & MecoPay Secured Engine
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                কাস্টমার বা মার্চেন্ট কখনোই বুঝবে না পেছনে Tazapay কাজ করছে! সম্পূর্ণ চেকআউট পেজটি আপনার <strong>MecoPay Architecture & Client Branding</strong> দিয়েই প্রদর্শিত হবে।
              </p>
              
              {/* Step by Step Checkout Visual Layout */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-4 space-y-3">
                <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <span className="bg-amber-400/20 text-amber-300 text-xs px-2 py-0.5 rounded">CHECKOUT PAGE LAYOUT</span>
                  White-Label Checkout Screen Structure (Step-by-Step)
                </h4>
                <div className="grid md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1.5">
                    <span className="font-bold text-emerald-400 block border-b border-slate-700 pb-1">1. Top Header (Merchant Brand)</span>
                    <p className="text-slate-300">উপরে ক্লায়েন্টের নিজস্ব <strong>Brand Name & Logo</strong> থাকবে (যেমন: TechShop BD, Apex Store)। কাস্টমার নিশ্চিত হবে সে সঠিক শপ থেকে কিনছে।</p>
                  </div>

                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1.5">
                    <span className="font-bold text-blue-400 block border-b border-slate-700 pb-1">2. Order Details & Coupon</span>
                    <p className="text-slate-300">প্রোডাক্ট নাম, পরিমাণ, ডিসকাউন্ট কুপন ফিল্ড, শিপিং এড্রেস (ফিজিক্যাল হলে) এবং টোটাল অ্যামাউন্ট স্পষ্ট দেখাবে।</p>
                  </div>

                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1.5">
                    <span className="font-bold text-purple-400 block border-b border-slate-700 pb-1">3. Footer Security & Report</span>
                    <p className="text-slate-300">নিচে চমৎকার <strong>"MecoPay Verified & Secured"</strong> ব্যাজ থাকবে, পাশে একটি <strong>"Report Merchant"</strong> লিংক/বাটন থাকবে। কোনো ভুয়া শপ হলে কাস্টমার রিপোর্ট করতে পারবে।</p>
                  </div>
                </div>
                <div className="bg-indigo-950/70 border border-indigo-500/30 p-3 rounded-lg text-xs text-indigo-200">
                  <strong> Next Page / Modal Transition (Payment Execution):</strong> কাস্টমার "Proceed to Pay" বাটনে চাপ দিলে পরের পেজে/পপআপে কাস্টমারের দেশ অনুযায়ী (Geo-IP) লোকাল bKash, Nagad, Card, UPI পেমেন্ট অপশনগুলো সুন্দরভাবে চলে আসবে এবং পেমেন্ট শেষে মার্চেন্ট ড্যাশবোর্ডে রিয়েলটাইম রিপোর্ট ও সাকসেস স্ট্যাটাস আপডেট হবে।
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
                  <h4 className="font-bold text-indigo-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    MecoPay Platform (What You & Merchants See)
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                    <li><strong>White-Label MecoPay Checkout UI:</strong> মার্চেন্টের ব্র্যান্ড লোগো, "MecoPay Secured" ব্যাজ, রিপোর্ট বাটন, অর্ডারের বিবরণ, এবং কুপন কোড সহ কাস্টমাইজড চেকআউট।</li>
                    <li><strong>Real-time Analytics & Financial Reports:</strong> দৈনিক/মাসিক মোট সেলস, কোন কান্ট্রি থেকে কত পেমেন্ট এলো, কুরিয়ার রিটার্ন রেট, প্ল্যাটফর্ম ফি (১%), এবং নেট প্রফিট রিপোর্ট থাকবে MecoPay অ্যাডমিন ও মার্চেন্ট প্যানেলে।</li>
                    <li><strong>Instant Webhook Syncing:</strong> পেমেন্ট সাকসেস হওয়ার সাথে সাথে Webhook এসে Supabase-এর <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-amber-300">transactions</code> টেবিলে ডাটা সেভ করবে এবং MecoPay ড্যাশবোর্ডে রিয়েলটাইমে গ্রাফ আপডেট হবে।</li>
                    <li><strong>Automated Merchant Payouts:</strong> মার্চেন্টরা তাদের উপার্জিত টাকা MecoPay প্যানেল থেকেই নিজের বিকাশ/নগদ বা ব্যাংক অ্যাকাউন্টে উইথড্র রিকোয়েস্ট দেবে।</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
                  <h4 className="font-bold text-teal-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    Tazapay Engine (Silent Backend Banking Rails)
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                    <li><strong>Cross-Border Banking License:</strong> আন্তর্জাতিক মাস্টারকার্ড, ভিসা, পেপাল, ইউপিআই, বিক্যাশ, নগদ ইত্যাদির আন্তর্জাতিক সুইফট/লোকাল ব্যাংকিং পারমিট ব্যাকএন্ডে সামলাবে।</li>
                    <li><strong>FX Currency Settlement:</strong> কাস্টমারের ইউরো/ডলার/রুপি গ্রহণ করে তা বিডিটি (BDT) তে অটোমেটিক কনভার্ট করে MecoPay-এর মাস্টার একাউন্টে পাঠাবে।</li>
                    <li><strong>PCI-DSS Level 1 Security:</strong> কার্ডের সিক্রেট নাম্বার বা ব্যাংকিং ডাটা Tazapay এনক্রিপ্ট করবে, ফলে MecoPay-কে ভারী কার্ড এনক্রিপশন লাইসেন্স নিতে হবে না।</li>
                    <li><strong>Dispute & Chargeback Protection:</strong> আন্তর্জাতিক কার্ড ফ্রড বা চার্জব্যাক আসলে তা ব্যাকএন্ডে Tazapay রিস্ক ইঞ্জিন দিয়ে হ্যান্ডেল করবে।</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Subsection 5: Scaling Architecture, Tazapay Fee Split & Persistent User Memory */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded font-mono">SCALING & SYSTEM LOGIC</span>
                Scaling Infrastructure ($800/mo vs Amazon Scale), Fee Structure & Persistent User Memory
              </h3>
              
              <div className="space-y-4 text-xs">
                {/* Point 1: Tazapay Money Flow & Zero UI Burden */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-emerald-400 text-sm mb-1">১. Tazapay Money Flow & Zero Mobile Banking UI Maintenance</h4>
                  <p className="text-slate-300 leading-relaxed mb-2">
                    Tazapay প্রতিটি পেমেন্টে ব্যাংকিং প্রসেসিং ফি (যেমন: ~১.৫% থেকে ২.৫%) কেটে নেবে। আপনার MecoPay তার উপরে <strong>১% প্ল্যাটফর্ম ফি</strong> যোগ করে কাস্টমার বা মার্চেন্ট থেকে চার্জ করবে।
                  </p>
                  <p className="text-slate-300 leading-relaxed font-semibold text-amber-300">
                    সুবিধা: বিকাশ, নগদ, ইউপিআই বা কার্ডের কোনো পিন বা OTP ডায়ালগ ডিজাইন আপনাকে করতে হবে না! Tazapay-এর সিকিউর চেকআউট ফ্রেমওয়ার্ক বিশ্বমানের সিকিউরিটি ও OTP স্ক্রিন অটোমেটিক ম্যানেজ করে।
                  </p>
                </div>

                {/* Point 2: Supabase (Mumbai) + Cloudflare Enterprise Scaling */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-blue-400 text-sm mb-1">২. Global Speed (Supabase Mumbai + Cloudflare) & $800/Month Capacity</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    <li><strong>Initial Setup ($800/month = $500 Supabase Team/Enterprise + $300 Cloudflare Enterprise/Pro):</strong> Cloudflare-এর ২৭০+ গ্লোবাল এজ সার্ভার ফন্টএন্ড ও স্টেটিক ফাইল মাত্র ১০-২০ মি.সেকেন্ড স্পিডে পৃথিবীর যেকোনো দেশ থেকে লোড করাবে। Supabase Mumbai (ap-south-1) ডাটাবেসে Supavisor (Connection Pooling) চালু থাকবে।</li>
                    <li><strong>Capacity Limit:</strong> এই $৮০০/মাস বাজেট দিয়ে আপনি অনায়াসে <strong>৫০ লক্ষ থেকে ১ কোটি মান্থলি রিকোয়েস্ট/ট্রানজেকশন (5M-10M Monthly Requests)</strong> স্মুথলি চালাতে পারবেন!</li>
                    <li><strong>When to go Amazon-Level Custom AWS Infrastructure?</strong> যদি MecoPay আমাজনের মতো ১০০ কোটি ডলারের স্কেলে পৌঁছায় (প্রতি সেকেন্ডে ৫০,০০০+ ট্রানজেকশন), তখন Supabase Cloud থেকে আপনি <strong>AWS Aurora Serverless Multi-Region Read Replicas (Frankfurt, Singapore, N. Virginia, Mumbai)</strong> বা Self-hosted Kubernetes Cluster-এ শিফট করবেন।</li>
                  </ul>
                </div>

                {/* Point 3: Persistent Country & Language Memory */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-rose-400 text-sm mb-1">৩. Persistent Country, Language & Login Memory (No VPN Confusion)</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    <li><strong>First-time Visit (Geo-IP & Browser Language):</strong> প্রথমবার সাইটে ঢুকলে Cloudflare Header (<code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-amber-300">CF-IPCountry</code> & <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-amber-300">Accept-Language</code>) দিয়ে ইউজার যে দেশে আছে সে দেশের ভাষা ও কারেন্সি অটো-সিলেক্ট হবে।</li>
                    <li><strong>Saved in Supabase Profile:</strong> ইউজার বা মার্চেন্ট অ্যাকাউন্ট খোলার সাথে সাথে তার কান্ট্রি কোড ও পছন্দের ভাষা Supabase <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-amber-300">profiles.country_code</code> ও <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-amber-300">profiles.language</code> কলামে স্থায়ীভাবে সেভ হয়ে যাবে।</li>
                    <li><strong>Next Login Consistency:</strong> পরেরবার লগিন করলে ব্যাকএন্ড সরাসরি তার সেভ করা প্রোফাইল কান্ট্রি ও ল্যাঙ্গুয়েজ লোড করবে। ইউজার যদি ভিপিএন অন করে বা অন্য কোনো দেশে ট্রাভেল করে লগিন করে, তাও তার প্রোফাইলের অরিজিনাল কান্ট্রি সেটিং ও এক্সেসই দেখাবে—কোনো ভুল দেশে পেজ রিডাইরেক্ট হবে না!</li>
                  </ul>
                </div>

                {/* Point 4: Supabase to AWS RDS/Aurora Migration Blueprint */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-cyan-400 text-sm mb-1">৪. Supabase to AWS RDS/Aurora Zero-Downtime Migration Blueprint</h4>
                  <p className="text-slate-300 leading-relaxed mb-2">
                    <strong>হ্যাঁ, ১০০% পসিবল এবং একদম সহজ!</strong> কারণ Supabase কোনো ভেন্ডর-লকড ডাটাবেস নয়, এটি শতভাগ ওপেন-সোর্স <strong>PostgreSQL</strong> ইঞ্জিনের ওপর তৈরি।
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">
                    <li><strong>Zero Data Loss via PostgreSQL Logical Replication:</strong> Supabase-কে Publisher এবং AWS Aurora Serverless PostgreSQL-কে Subscriber হিসেবে সেটআপ করে রিয়েলটাইম লজিক্যাল রেপ্লিক্যাশন চালু করা হবে। এতে চলমান ডাটাবেসে ০ সেকেন্ড ডাউনটাইমে সব ট্রানজেকশন অটো-সিঙ্ক হবে।</li>
                    <li><strong>AWS Database Migration Service (AWS DMS):</strong> AWS DMS টুল ১ ক্লিকে Supabase এর সব ডাটাবেস স্কিমা, টেবিল, ইউজার ক্র্যাডেনশিয়াল ও বায়োমেট্রিক পাবলিক-কী হ্যাশ AWS Aurora-তে হুবহু ট্রান্সফার করে নেবে।</li>
                    <li><strong>Instant Switchboard (1-Env Variable Update):</strong> Next.js বা Node.js ব্যাকএন্ডে শুধু <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-amber-300">DATABASE_URL</code> এনভায়রনমেন্ট ভেরিয়েবলটি Supabase URL থেকে পরিবর্তন করে AWS RDS Endpoint সেভ করে রি-ডেপ্লয় দিলেই ১ সেকেন্ডে পুরো সিস্টেম AWS-এ মাইগ্রেট হয়ে যাবে!</li>
                  </ol>
                </div>

                {/* Point 5: Domain & Hosting Sales with Razorpay & Local Gateways (Zero Dual-Currency Card Needed) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-amber-400 text-sm mb-1">৫. Domain & Hosting Sales Engine: Razorpay + Local MFS Integration (No Dual-Currency Card Needed)</h4>
                  <p className="text-slate-300 leading-relaxed mb-2">
                    <strong>হ্যাঁ, Razorpay এবং লোকাল bKash/Nagad পেমেন্ট ১০০০% অ্যাড করা যাবে এবং এটি MecoPay-এর বড় একটি অ্যাডভান্টেজ!</strong>
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                    <li><strong>Problem Solved (Dual-Currency Card Barrier):</strong> বাংলাদেশ বা ভারতের ৮০%+ ক্ষুদ্র উদ্যোক্তার আন্তর্জাতিক ডুয়েল কারেন্সি ক্রেডিট কার্ড (ডলার পাসপোর্ট এন্ডোর্সমেন্ট) থাকে না। ফলে তারা Godaddy/Namecheap থেকে ডোমেইন-হোস্টিং কিনতে পারে না।</li>
                    <li><strong>How MecoPay Solves This:</strong>
                      <ul className="list-circle pl-4 mt-1 space-y-1 text-slate-400">
                        <li><strong>For Indian & Regional Clients:</strong> **Razorpay Integration** দিয়ে তারা UPI (GPay, PhonePe, Paytm), NetBanking, বা RuPay কার্ড দিয়ে সরাসরি রুপিতে (INR) পেমেন্ট করবে।</li>
                        <li><strong>For Bangladeshi Clients:</strong> বিকাশ, নগদ, রকেট বা লোকাল ডেবিট কার্ড দিয়ে টাকায় (BDT) পেমেন্ট করবে।</li>
                        <li><strong>For Global/Western Clients:</strong> Tazapay দিয়ে যেকোনো আন্তর্জাতিক মাস্টার/ভিসা কার্ড বা পেপাল দিয়ে পে করবে।</li>
                      </ul>
                    </li>
                    <li><strong>Backend Reseller API Automated Provisioning:</strong> কাস্টমার লোকাল পেমেন্ট সম্পন্ন করার সাথে সাথে MecoPay-এর ব্যাকএন্ড **Namecheap Reseller API / ResellerClub API / Cloudflare Registrar API** কল করে ইউজারকে ১ সেকেন্ডে ডোমেইন রেজিস্টার ও হোস্টিং সার্ভার কানেক্ট করে দেবে। ক্লায়েন্টের ১ ডলারও আন্তর্জাতিক কার্ড থাকা লাগবে না!</li>
                  </ul>
                </div>

                {/* Point 6: Foreign Advance Payment Flow & MecoPay Mobile App Auto-Verification */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-emerald-400 text-sm mb-1">৬. Foreign Advance Payment & MecoPay Android App Auto-Verification Role</h4>
                  
                  <div className="space-y-2 mt-2">
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <p className="font-bold text-amber-300 text-xs mb-1">ক) অ্যাপ কেন দরকার? (When using Personal bKash/Nagad / Saving PG Fees):</p>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Tazapay বা অফিশিয়াল PG ব্যবহার করলে ২.৫%-৩% মার্চেন্ট ফি দিতে হয়। কিন্তু বাংলাদেশে ৯০%+ ছোট মার্চেন্ট তাদের **পার্সোনাল বিকাশ/নগদ (Send Money / Cash In)** বা মার্চেন্ট অ্যাকাউন্ট ফি ছাড়া ব্যবহার করতে চায়। এখানেই MecoPay Android App-এর আসল জাদুকরী ভূমিকা:
                      </p>
                      <ul className="list-circle pl-4 mt-1 space-y-1 text-slate-400 text-xs">
                        <li><strong>Android Notification & SMS Listener Hook:</strong> মার্চেন্টের নিজস্ব ফোনে MecoPay App ব্যাকগ্রাউন্ডে চলবে। কোনো কাস্টমার পেমেন্ট বা অ্যাডভান্স টাকা সেন্ড করলে ফোনে বিকাশ/নগদের SMS (যেমন: <em>"Received Tk 500.00 from 017... TrxID 9A8B7C6D"</em>) আসা মাত্রই MecoPay App ১ সেকেন্ডে নোটিফিকেশন থেকে **TrxID & Amount** রিড করবে।</li>
                        <li><strong>Instant Zero-Fee Auto-Match:</strong> MecoPay App ব্যাকএন্ড API-কে মেসেজ পাঠিয়ে চেকআউট পেজের পেন্ডিং অর্ডারের সাথে মিলিয়ে সাথে সাথে স্ট্যাটাস "Payment Verified / Paid" করে দেবে! এতে ১ পয়সাও থার্ড-পার্টি পেমেন্ট গেটওয়ে ফি দেওয়া লাগে না!</li>
                      </ul>
                    </div>

                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <p className="font-bold text-cyan-300 text-xs mb-1">খ) পাকিস্তানের বা বিদেশি কাস্টমার কিভাবে পেমেন্ট করবে (তার তো bKash নেই!):</p>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        বিদেশি কোনো কাস্টমারের বিকাশ থাকবে না। কাস্টমার MecoPay-এর চেকআউট পেজে তার দেশের লোকাল মেথড (JazzCash, Raast, Card) দেখবে এবং Tazapay ব্যাকএন্ডে টাকা কেটে BDT (বাংলাদেশি টাকা) তে কনভার্ট করে মার্চেন্টের বিডিটি একাউন্টে পাঠিয়ে দেবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 7: Strategic Phased Rollout (BD MVP Phase 1 -> Global Tazapay Phase 2) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-indigo-400 text-sm mb-1">৭. Strategic Phased Execution: BD MVP (Phase 1) ➔ Global Expansion (Phase 2)</h4>
                  <p className="text-slate-300 leading-relaxed mb-2">
                    <strong>একদম নিখুঁত ও বুদ্ধিমান স্ট্র্যাটেজি!</strong> বিজনেস সাকসেস করার সবচেয়ে বেস্ট এপ্রোচ হলো পর্যায়ক্রমে আগানো:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 mt-2 text-xs">
                    <div className="bg-slate-800/90 p-3 rounded-lg border border-indigo-500/30 space-y-1.5">
                      <span className="font-bold text-indigo-300 block text-xs border-b border-slate-700 pb-1">Phase 1: Bangladesh Local MVP (Initial Launch)</span>
                      <p className="text-slate-300">
                        • আপনার নিজের মার্চেন্ট একাউন্ট + MecoPay Android App (SMS Auto-Verification) দিয়ে বাংলাদেশে শুরু হবে।<br />
                        • মার্চেন্টরা জিরো-ফি বা কম খরচে বিকাশ/নগদ/রকেট পেমেন্ট নেবে।<br />
                        • এতে সিস্টেম সম্পূর্ণ স্ট্যাবল হবে, মার্চেন্টরা ট্রাস্ট পাবে এবং লোকাল মার্কেট ক্যাপচার হবে।
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-lg border border-teal-500/30 space-y-1.5">
                      <span className="font-bold text-teal-300 block text-xs border-b border-slate-700 pb-1">Phase 2: Global Cross-Border Expansion (Tazapay Plug)</span>
                      <p className="text-slate-300">
                        • বাংলাদেশে সফল হওয়ার পর Cross-Border ফিচার হিসেবে Tazapay এবং Razorpay আনলক করা হবে।<br />
                        • তখন বাংলাদেশি কাস্টমারদের পাশাপাশি ভারত, পাকিস্তান, ইউরোপ, আমেরিকা থেকে আন্তর্জাতিক পেমেন্ট সরাসরি গ্রহণ করা যাবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 8: High-Value Purchases (High-Ticket Laptop/iPhone MFS Limit Solutions) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-amber-400 text-sm mb-1">৮. High-Value Purchases (Laptop / iPhone / High Ticket Limit Solutions)</h4>
                  <p className="text-slate-300 leading-relaxed mb-2">
                    MFS (বিকাশ/নগদ) এ দৈনিক ২৫,০০০-৫০,০০০ টাকার লিমিট থাকে। তাই ৫০,০০০ থেকে ২-৩ লাখ টাকার আইফোন বা ল্যাপটপ কেনার জন্য MecoPay ৩টি সলিউশন প্রদান করে:
                  </p>
                  <div className="grid md:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                      <strong className="text-emerald-300 block mb-1">১. Local & Dynamic Virtual Bank Wire (RTGS / NPSB)</strong>
                      <p className="text-slate-300">MecoPay / Tazapay কাস্টমারের জন্য ডাইনামিক ভার্চুয়াল ব্যাংক অ্যাকাউন্ট নম্বর বা ব্যাংকিং সুইফট ডিটেইলস দেবে। যেকোনো ব্যাংক অ্যাপ (Citytouch, EBL, Brac, Islami Bank) থেকে কোনো লিমিট ছাড়াই সরাসরি ফান্ড ট্রান্সফার করা যাবে।</p>
                    </div>
                    <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                      <strong className="text-cyan-300 block mb-1">২. Split Advance + Remaining COD / Bank Payment</strong>
                      <p className="text-slate-300">কাস্টমার MFS (বিকাশ/নগদ) দিয়ে ১০,০০০ টাকা এডভান্স সিকিউরিটি পে করবে এবং বাকি টাকা প্রোডাক্ট ডেলিভারি নেওয়ার সময় ক্যাশ অন ডেলিভারি (COD) বা অনলাইন ব্যাংক দিয়ে শোধ করবে।</p>
                    </div>
                    <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                      <strong className="text-purple-300 block mb-1">৩. Global Credit Cards & Bank Wire / EMI</strong>
                      <p className="text-slate-300">আন্তর্জাতিক বা লোকাল ক্রেডিট কার্ডে লাখ টাকার বেশি ট্রানজেকশন লিমিট থাকে এবং ইএমআই (EMI) সুবিধাও পাওয়া যায়। Tazapay ও লোকাল কার্ড প্রসেসর দিয়ে খুব সহজে উচ্চমূল্যের পেমেন্ট সম্পূর্ণ করা যাবে।</p>
                    </div>
                  </div>
                </div>

                {/* Point 9: Amazon-Style Global Marketplace Evolution */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-amber-500/40">
                  <h4 className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-amber-400 text-slate-950 text-xs font-mono font-bold px-2 py-0.5 rounded">GRAND VISION</span>
                    ৯. Phase 3 Evolution: Transforming MecoPay into an Amazon-Style Global Marketplace Ecosystem
                  </h4>
                  <p className="text-slate-300 leading-relaxed mb-2">
                    <strong>এটি একটি গেম-চেঞ্জিং মাস্টারপ্ল্যান!</strong> যখন হাজার হাজার মার্চেন্ট তাদের শপ ও প্রোডাক্ট MecoPay-তে তুলবে, তখন MecoPay শুধুমাত্র একটি পেমেন্ট সার্ভিস বা শপ বিল্ডার থাকবে না—এটি **AliExpress / Amazon / Shopify Marketplace**-এর মতো একটি বিশাল সেন্ট্রাল মার্কেটপ্লেসে পরিণত হবে:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                    <li><strong>Unified MecoPay Central Search Engine:</strong> বিশ্বজুড়ে যেকোনো কাস্টমার <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-amber-300">mecopay.com</code> মার্কেটপ্লেসে এসে যেকোনো প্রোডাক্ট সার্চ করতে পারবে। আপনার ক্লায়েন্টদের সমস্ত ক্যাটালগ অটো-সিঙ্ক হয়ে এখানে ডিসপ্লে হবে।</li>
                    <li><strong>One-Click Global Checkout:</strong> ইউজার আমেরিকা, যুক্তরাজ্য বা মধ্যপ্রাচ্য যে দেশেই থাকুক না কেন—একই কার্টে বিভিন্ন ক্লায়েন্টের প্রোডাক্ট একসাথে যুক্ত করে তার লোকাল মুদ্রা বা কার্ড দিয়ে ১ ক্লিকে অর্ডার করতে পারবে।</li>
                    <li><strong>Automated Escrow & Multi-Vendor Payouts:</strong> কাস্টমারের পেমেন্ট MecoPay সিকিউর এসক্রো (Escrow) তে হোল্ড থাকবে। প্রোডাক্ট কুরিয়ার মারফত ডেলিভারি হওয়ার সাথে সাথে MecoPay অটোমেটিক সেই নির্দিষ্ট মার্চেন্টদের ওয়ালেটে তাদের বিক্রয়লব্ধ টাকা পাঠাবে।</li>
                    <li><strong>Integrated Global Logistics (DHL/FedEx/Aramex):</strong> কাস্টমার শিপিং এস্টিমেট ও কুরিয়ার চয়েস সরাসরি মার্কেটপ্লেস থেকেই দেখতে পারবে—ফলে যেকোনো বাংলাদেশি মার্চেন্ট আমেরিকা বা ইউরোপে নিজের পণ্য বিক্রি করতে পারবে!</li>
                  </ul>
                </div>

                {/* Point 10: Micro-Sellers & Multi-Country MFS Logistics Escrow */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-teal-400 text-sm mb-1">১০. Small Sellers Empowerment & Multi-Country MFS Logistics Flow</h4>
                  
                  <div className="space-y-2 mt-2">
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <p className="font-bold text-amber-300 text-xs mb-1">ক) ছোট ও পেজ-ভিত্তিক উদ্যোক্তারা (Small/Micro Sellers) কিভাবে কাজ করবে?</p>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        ফেসবুক/ইনস্টাগ্রাম বা ক্ষুদ্র উদ্যোক্তাদের ট্রেড লাইসেন্স বা জটিল কর্পোরেট কাগজ থাকে না। MecoPay-তে তারা শুধু **জাতীয় পরিচয়পত্র (NID) ও বিকাশ/ব্যাংক অ্যাকাউন্ট** দিয়ে ১ মিনিটে ভেরিফাই করে ইন্সট্যান্ট পেমেন্ট লিংক বা শপ চালু করতে পারবে। কোনো জটিল এক্সপোর্ট লাইসেন্স ছাড়াই আন্তর্জাতিক অর্ডার নিতে পারবে।
                      </p>
                    </div>

                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <p className="font-bold text-cyan-300 text-xs mb-1">খ) কোন কোন দেশে এবং কিভাবে কাজ করবে?</p>
                      <ul className="list-circle pl-4 space-y-1 text-slate-300 text-xs">
                        <li><strong>বাংলাদেশ (BD):</strong> bKash, Nagad, Rocket, CellFin, Citytouch Bank, Local Cards.</li>
                        <li><strong>পাকিস্তান (PK):</strong> JazzCash, Easypaisa, Raast Instant Payment, Sadapay, PKR Bank Cards.</li>
                        <li><strong>ভারত (IN):</strong> UPI (PhonePe, Google Pay, Paytm), NetBanking, RuPay.</li>
                        <li><strong>মিডল ইস্ট (UAE / KSA):</strong> Tabby, Tamara (BNPL), Mada, Apple Pay, Benefit.</li>
                        <li><strong>ইউরোপ/আমেরিকা (US / UK / EU):</strong> Visa, MasterCard, PayPal, Apple Pay, Google Pay.</li>
                      </ul>
                    </div>

                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <p className="font-bold text-emerald-300 text-xs mb-1">গ) কুরিয়ার ভেরিফিকেশন ও সেফটি (Courier API + Escrow Protection):</p>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        ১. কাস্টমার তার দেশের লোকাল MFS বা কার্ড দিয়ে অ্যাডভান্স বা ফুল পেমেন্ট করবে, টাকা MecoPay **Escrow Hold**-এ জমা থাকবে।<br />
                        ২. মার্চেন্ট DHL / FedEx / Aramex / Steadfast কুরিয়ারে পণ্য শিপ করবে এবং ট্র্যাকিং আইডি MecoPay-তে ইনপুট দেবে।<br />
                        ৩. MecoPay-এর **Courier API Tracking Webhook** অটোমেটিক চেক করবে যে কাস্টমার পণ্যটি হাতে পেয়েছে কিনা। কুরিয়ার "Delivered" দেখানোর সাথে সাথেই MecoPay মার্চেন্টের ওয়ালেটে টাকা রিলিজ করে দেবে! ফলে কাস্টমার ও মার্চেন্ট উভয়ই ১০০% নিরাপদ থাকবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 11: MecoPay (BD) -> GecoPay (Global) Strategy & Why It Beats Amazon/Shopify */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-purple-500/40">
                  <h4 className="font-bold text-purple-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-purple-500 text-white text-xs font-mono font-bold px-2 py-0.5 rounded">GecoPay DISRUPTION</span>
                    ১১. Phase 1 (MecoPay BD) ➔ Phase 2 (GecoPay Global): How We Overtake Amazon & Shopify
                  </h4>
                  
                  <div className="space-y-3 mt-2 text-xs text-slate-300">
                    <p className="leading-relaxed bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <strong>একদম পারফেক্ট গেমপ্ল্যান!</strong> প্রথমে বাংলাদেশে <strong>MecoPay (Merchant + Personal MFS Auto-Verification)</strong> দিয়ে সিস্টেম ফুল টেস্ট ও লাভজনক করা হবে। এরপর গ্লোবাল স্কেলে **GecoPay (Global EcoPay)** নামে আন্তর্জাতিক ফিনটেক ও মার্কেটপ্লেস জায়ান্ট হিসেবে রি-ব্র্যান্ডিং করে রিলিজ করা হবে।
                    </p>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-slate-800/90 p-3 rounded-lg border border-rose-500/30">
                        <h5 className="font-bold text-rose-300 text-xs mb-1.5 border-b border-slate-700 pb-1">১. GecoPay vs Shopify (Shopify-কে টেক্কা দেওয়ার উপায়):</h5>
                        <ul className="space-y-1 list-disc pl-3 text-slate-300">
                          <li><strong>Shopify Limitation:</strong> শপিফাই শুধু স্টোর বানায় কিন্তু কোনো বায়িং ট্রাফিক দেয় না। মাসে $৩৯+ ফি নেয় এবং লোকাল MFS/আন্তর্জাতিক কার্ড প্রসেসিং ফ্রেন্ডলি না।</li>
                          <li><strong>GecoPay Advantage:</strong> জিরো মান্থলি সাবস্ক্রিপশন ফি। স্টোর খোলার সাথে সাথে অটোমেটিক <strong>GecoPay Central Marketplace</strong>-এ ফ্রি ট্রাফিক পাবে + প্রতিটি দেশের লোকাল MFS (bKash, JazzCash, UPI, Wallet) সাপোর্ট পাবে!</li>
                        </ul>
                      </div>

                      <div className="bg-slate-800/90 p-3 rounded-lg border border-amber-500/30">
                        <h5 className="font-bold text-amber-300 text-xs mb-1.5 border-b border-slate-700 pb-1">২. GecoPay vs Amazon (Amazon-কে টেক্কা দেওয়ার উপায়):</h5>
                        <ul className="space-y-1 list-disc pl-3 text-slate-300">
                          <li><strong>Amazon Limitation:</strong> আমাজন অত্যন্ত জটিল, অ্যাকাউন্ট ব্যান করে দেয়, ১৫-২০% হাই কমিশন কাটে এবং ছোট এশিয়ান মার্চেন্টদের লোকাল ওয়ালেটে ডলার ছাড়াই সরাসরি টাকা পাওয়ার সুযোগ দেয় না।</li>
                          <li><strong>GecoPay Advantage:</strong> ১ মিনিটে NID/Passport দিয়ে অনবোর্ডিং। মাত্র ১-২% প্ল্যাটফর্ম ফি। কোনো ডলার অ্যাকাউন্ট ছাড়াই পাকিস্তানি/বাংলাদেশি মার্চেন্ট সরাসরি তার লোকাল বিকাশ/ব্যাংকে নিজের কারেন্সিতে টাকা উইথড্র পাবে।</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 p-3 rounded-lg border border-emerald-500/30">
                      <strong className="text-emerald-300 block text-xs mb-1">🔥 GecoPay-এর আনবিটেবল মাস্টার ফর্মুলা (The Winning Formula):</strong>
                      <p className="text-slate-300 leading-relaxed">
                        <strong>GecoPay = (Shopify-এর স্টোর তৈরির স্বাধীনতা) + (Amazon-এর গ্লোবাল ট্রাফিক মার্কেটপ্লেস) + (MFS Cross-Border Local Payment Infrastructure)</strong>। এই ৩টি জিনিস একসাথে পৃথিবীতে কোনো কোম্পানি এখনও অফার করেনি—এটাই GecoPay-এর এক নম্বর গ্লোবাল মনোপলি স্ট্র্যাটেজি!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 12: Monetization & Global Logistics Strategy (Tazapay vs In-House & 3-5% Fair Pricing) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-emerald-500/40">
                  <h4 className="font-bold text-emerald-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 text-xs font-mono font-bold px-2 py-0.5 rounded">BUSINESS & LOGISTICS</span>
                    ১২. Global Pricing Model (3%-5%), Logistics & Tazapay Partnership Strategy
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <strong className="text-amber-300 block text-xs mb-1.5">১. Pricing Logic: ১% কেন কম এবং ৩%-৫% কেন পারফেক্ট?</strong>
                        <p className="text-slate-300 leading-relaxed mb-2">
                          বিশ্ববাজারে <strong>১% ফি অনেক কম</strong> এবং ব্যবসার জন্য ঝুঁকিপূর্ণ। অন্যান্য প্লাটফর্মের তুলনা দেখুন:
                        </p>
                        <ul className="list-disc pl-3 space-y-1 text-slate-300">
                          <li><strong>Amazon:</strong> ১৫% থেকে ৩০% পর্যন্ত হাই কমিশন কাটে।</li>
                          <li><strong>Etsy:</strong> ৬.৫% কমিশন + লিস্টিং ফি + পেমেন্ট প্রসেসিং ফি (~১০% মোট)।</li>
                          <li><strong>GecoPay Physical Products:</strong> <strong>৩% - ৫% কমিশন</strong> (যা আমাজনের চেয়ে ৩ গুণ সস্তা, তাই মার্চেন্টরা খুব খুশিতে আসবে)।</li>
                          <li><strong>GecoPay Digital Products:</strong> <strong>২% - ৩% কমিশন</strong> (ডিজিটাল ফাইলে ডেলিভারি ও রিস্ক কম)।</li>
                          <li><strong>MecoPay BD Local MFS (Phase 1):</strong> ০.৫% - ১% অথবা ফ্ল্যাট মান্থলি সাবস্ক্রিপশন ($5/mo)।</li>
                        </ul>
                      </div>

                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <strong className="text-cyan-300 block text-xs mb-1.5">২. Tazapay vs In-House Infrastructure & Global Delivery:</strong>
                        <ul className="list-disc pl-3 space-y-1.5 text-slate-300">
                          <li><strong>কেন Tazapay দিয়ে শুরু?</strong> শুরুতেই ১৫০+ দেশের ফিনান্সিয়াল লাইসেন্স ও সুইফট ব্যাংকিং পার্টনারশিপ তৈরি করা প্রায় অসম্ভব ও কোটি ডলারের কাজ। Tazapay আমাদের সিকিউর ব্যাকএন্ড লিগ্যাল লাইসেন্সিং ও FX ব্যাংকিং হিসেবে কাজ করবে।</li>
                          <li><strong>ভবিষ্যতে GecoPay Own License:</strong> গ্লোবাল ভলিউম যখন কোটি ডলারে যাবে, তখন GecoPay সরাসরি সিঙ্গাপুর MAS / UK FCA থেকে নিজস্ব পেমেন্ট ইনস্টিটিউশন লাইসেন্স নিয়ে নেবে।</li>
                          <li><strong>Global Logistics Engine:</strong> DHL, Aramex, FedEx API সরাসরি GecoPay-এর সাথে ইন্টিগ্রেটেড থাকবে। কাস্টমার পণ্য কেনার সময় ওজন ও কান্ট্রি অনুযায়ী লাইভ শিপিং চার্জ দেখতে পাবে এবং কুরিয়ার ডেলিভারি কনফার্ম করলেই মার্চেন্ট তার টাকা পাবে।</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 13: Escrow Holding, Order Cancellation & Return Compensation Mechanism */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-cyan-500/40">
                  <h4 className="font-bold text-cyan-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-cyan-500 text-slate-950 text-xs font-mono font-bold px-2 py-0.5 rounded">SMART ESCROW & REFUNDS</span>
                    ১৩. Escrow Hold, Order Cancellation & Return Compensation Flow (via Tazapay / MecoPay API)
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300">
                    <p className="leading-relaxed bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <strong>পেমেন্ট সিকিউরিটি ও লস প্রটেকশন ইঞ্জিনিয়ারিং:</strong> কাস্টমার যখন এডভান্স বা ফুল পেমেন্ট করে, টাকা সরাসরি মার্চেন্ট বা কাস্টমারের অ্যাকাউন্টে যায় না। এটি <strong>Tazapay / MecoPay Escrow Vault</strong>-এ সেফলি হোল্ড অবস্থায় থাকে।
                    </p>

                    <div className="grid md:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <strong className="text-emerald-300 block mb-1.5 font-bold">১. Order Cancel (Before Shipping):</strong>
                        <p className="text-slate-300 leading-relaxed">
                          মার্চেন্ট শিপমেন্ট শুরু করার আগে অর্ডার ক্যানসেল হলে MecoPay API Tazapay-এর <code className="bg-slate-900 px-1 py-0.5 text-amber-300 rounded text-[11px]">POST /v1/escrow/refund</code> কল করবে। কাস্টমার তার টাকা ১০০% ফুল রিফান্ড পেয়ে যাবে।
                        </p>
                      </div>

                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <strong className="text-amber-300 block mb-1.5 font-bold">২. Courier Rejection / Return (After Shipping):</strong>
                        <p className="text-slate-300 leading-relaxed">
                          শিপ করার পর কাস্টমার পার্সেল রিসিভ করতে অস্বীকৃতি জানালে কুরিয়ারের রিটার্ন ড্যামেজ বা শিপিং খরচ কাটার দরকার হয়। MecoPay Tazapay-এর <code className="bg-slate-900 px-1 py-0.5 text-cyan-300 rounded text-[11px]">POST /v1/escrow/partial_refund</code> কল করে:
                          <br />• <strong>Shipping Fee Deducted:</strong> কুরিয়ার ড্যামেজ চার্জ (যেমন $১৫ বা ২০0 টাকা) হোল্ড মানি থেকে কেটে **মার্চেন্ট ওয়ালেটে** চলে যাবে।
                          <br />• <strong>Remaining Refund:</strong> অবশিষ্ট টাকা কাস্টমারের অ্যাকাউন্টে ব্যাক হয়ে যাবে।
                        </p>
                      </div>

                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <strong className="text-indigo-300 block mb-1.5 font-bold">৩. Successful Delivery (Auto Release):</strong>
                        <p className="text-slate-300 leading-relaxed">
                          কুরিয়ারের Webhook API যখন স্ট্যাটাস "Delivered" পাঠাবে, ৩ দিন পর MecoPay <code className="bg-slate-900 px-1 py-0.5 text-emerald-300 rounded text-[11px]">POST /v1/escrow/release</code> কল করবে। মার্চেন্ট প্ল্যাটফর্ম ফি (৩-৫%) বাদ দিয়ে পুরো টাকা তুলে নিতে পারবে।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 14: API Key vs Dynamic Product Payload & Same Price Disambiguation */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-indigo-500/40">
                  <h4 className="font-bold text-indigo-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-indigo-500 text-white text-xs font-mono font-bold px-2 py-0.5 rounded">DEVELOPER & LINK ENGINE</span>
                    ১৪. API Key System: How 1 API Key Handles Millions of Products (Same Price Disambiguation)
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300">
                    <p className="leading-relaxed bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <strong>মার্চেন্টদের প্রশ্ন:</strong> <em>"আমার দোকানে ১০০০টি প্রোডাক্ট আছে, তাহলে কি ১০০০টি API Key লাগবে? আর ২টি আলাদা প্রোডাক্টের দাম যদি ৫০০ টাকা হয়, তাহলে MecoPay API কিভাবে বুঝবে কোনটা বিক্রি হলো?"</em>
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1.5">
                        <strong className="text-amber-300 block text-xs">১. API Key Is Unique To Store (Not To Product):</strong>
                        <p className="text-slate-300 leading-relaxed">
                          মার্চেন্টের অ্যাকাউন্টে মাত্র <strong>১টি Secret API Key</strong> (<code className="bg-slate-900 text-amber-300 px-1 py-0.5 rounded">mec_sec_live_99xx...</code>) থাকবে। এটি মার্চেন্টের পরিচয় প্রকাশ করে। এটি দিয়ে ১টি নয়, ১ কোটি প্রোডাক্টের পেমেন্ট হ্যান্ডেল করা সম্ভব!
                        </p>
                      </div>

                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1.5">
                        <strong className="text-cyan-300 block text-xs">২. Dynamic API Payload (Same Price Solution):</strong>
                        <p className="text-slate-300 leading-relaxed">
                          যখন কোনো কাস্টমার শার্ট (দাম ৫০০ টাকা) বা ঘড়ি (দাম ৫০০ টাকা) এর "Buy Now" বাটনে ক্লিক করে, মার্চেন্টের সাইট MecoPay API-তে একটি Dynamic JSON ডাটাপ্যাক পাঠায়:
                        </p>
                        <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-emerald-400 border border-slate-800">
                          {`// MecoPay API Request Payload
{
  "order_id": "ORD-9981",
  "product_id": "PROD-SHIRT-A", // Unique ID
  "product_name": "Slim Fit Shirt",
  "amount": 500, // Price
  "currency": "BDT"
}`}
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          দাম সমান হলেও <code className="text-amber-300">product_id</code> ও <code className="text-amber-300">order_id</code> আলাদা হওয়ায় MecoPay API ১ মিলি-সেকেন্ডে নিখুঁতভাবে প্রোডাক্টটি চিনে নেয়।
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-lg border border-teal-500/30">
                      <strong className="text-teal-300 block text-xs mb-1 font-bold">৩. No-Code Payment Links / Buy Buttons (For FB Sellers):</strong>
                      <p className="text-slate-300 leading-relaxed">
                        যেসব উদ্যোক্তা কোডিং পারে না (ফেসবুক পেজ বা শপিফাই সেলার), তারা MecoPay Dashboard থেকে ১ ক্লিকে <strong>Dynamic Payment Link</strong> তৈরি করবে। প্রতিটি প্রোডাক্টের লিংকে ইউনিক প্রোডাক্ট আইডি লুকানো থাকে (যেমন: <code className="bg-slate-900 text-teal-300 px-1 py-0.5 rounded">mecopay.com/pay/lnk_shirt_500</code>)। ফলে ওয়েবসাইট ছাড়া ফেসবুক মেসেঞ্জারে লিংক পাঠিয়ে দিলেও পেমেন্ট ও প্রোডাক্ট ট্র্যাকিং অটোমেটিক হয়ে যাবে!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 15: Next.js Edge Runtime + Supabase API Key Engine (No n8n & Cursor AI Ready) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-emerald-500/40">
                  <h4 className="font-bold text-emerald-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 text-xs font-mono font-bold px-2 py-0.5 rounded">NATIVE NEXT.JS & SUPABASE</span>
                    ১৫. Direct API Key Management via Next.js Edge Runtime & Supabase (n8n ছাড়া ও Cursor AI দিয়ে ডেভেলপমেন্ট)
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300">
                    <p className="leading-relaxed bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <strong>n8n ছাড়া কি API Key পরিচালনা করা সম্ভব?</strong> হ্যাঁ, ১০০% সম্ভব এবং সেটাই সবচেয়ে প্রফেশনাল ও দ্রুততম উপায়! n8n একটি নো-কোড অটোমেশন টুল, কিন্তু হাই-স্পিড পেমেন্ট প্রসেসিং ও API Key ভ্যালিডেশনের জন্য সরাসরি <strong>Next.js Edge Middleware + Supabase</strong> ব্যবহার করাই গ্লোবাল স্ট্যান্ডার্ড (যেমন Stripe বা Razorpay করে)।
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1.5">
                        <strong className="text-cyan-300 block text-xs font-bold">১. How Next.js Edge + Supabase Handles API Keys (&lt;5ms Speed):</strong>
                        <ul className="list-disc pl-3 space-y-1 text-slate-300">
                          <li><strong>Key Generation:</strong> মার্চেন্ট ড্যাশবোর্ড থেকে বোতাম চাপলে Next.js ব্যাকএন্ড ক্রিপ্টোগ্রাফিক সিকিউর কী (<code className="text-amber-300">mec_sec_live_99x...</code>) জেনারেট করবে।</li>
                          <li><strong>SHA-256 Hashing in Supabase:</strong> আসল কী প্লেটে টেক্সট হিসেবে না রেখে Supabase-এ SHA-256 দিয়ে হ্যাশ করে সেভ রাখা হবে।</li>
                          <li><strong>Edge Verification:</strong> ক্লায়েন্ট যখন API কল করবে, Next.js Edge Middleware ৫ মিলি-সেকেন্ডের মধ্যে Supabase চেক করে পেমেন্ট রিকোয়েস্ট ভ্যালিড করবে।</li>
                        </ul>
                      </div>

                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1.5">
                        <strong className="text-amber-300 block text-xs font-bold">২. Cursor AI কি পুরো কোড বানিয়ে দিতে পারবে?</strong>
                        <p className="text-slate-300 leading-relaxed">
                          <strong>হ্যাঁ, Cursor AI ১ মিনিটে বানিয়ে দেবে!</strong> কাস্টম প্রম্পট দিলে Cursor AI সম্পূর্ণ Next.js App Router API Routes (<code className="text-emerald-300">/api/v1/checkout</code>), Supabase RLS Schemas, API Key Generation Utility এবং Webhook Dispatcher কোড নিখুঁতভাবে লিখে দেবে। n8n-এর ওপর বিন্দুমাত্র নির্ভর করতে হবে না!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 16: Business Model Breakdown (Amazon vs Shopify vs GecoPay) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-amber-500/40">
                  <h4 className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-amber-400 text-slate-950 text-xs font-mono font-bold px-2 py-0.5 rounded">BUSINESS MODEL COMPARISON</span>
                    ১৬. Core Business Model Differences: Amazon vs Shopify vs GecoPay
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300 leading-relaxed">
                    <div className="bg-slate-800/90 p-3 rounded-lg border border-red-500/30">
                      <h5 className="font-bold text-red-400 text-xs mb-1">১. Amazon (Monolithic Closed Marketplace):</h5>
                      <p className="text-slate-300">
                        <strong>আমাজনের প্রোডাক্ট কি আমাজনের নিজের?</strong> না! আমাজনের ৬০%-৭০% প্রোডাক্টই স্বাধীন থার্ড-পার্টি মার্চেন্ট ও সেলারদের। আমাজন মূলত একটি সেন্ট্রাল মার্কেটপ্লেস হিসেবে কাজ করে। তবে আমাজনের সমস্যা হলো তারা মার্চেন্টদের সেলস ডাটা ট্র্যাক করে নিজস্ব "Amazon Basics" ব্র্যান্ডের প্রোডাক্ট নামিয়ে মার্চেন্টদের ব্যবসা নষ্ট করে দেয়। তারা প্রতি সেলসে ১৫% থেকে ৩০% কমিশন কাটে, তার ওপর মাসিক প্রায় $৪০ ডলার সাবস্ক্রিপশন ও FBA ওয়্যারহাউস ফি নেয়। কাস্টমারের সম্পূর্ণ ডাটা ও ব্র্যান্ডিং আমাজনের কাছেই থাকে—মার্চেন্ট সেখানে কেবল একজন প্রোডাক্ট প্রোভাইডার। এছাড়া সাউথ এশিয়ান মার্চেন্টদের লোকাল বিকাশ বা ব্যাংকে সরাসরি নিজের কারেন্সিতে পেআউট পাওয়ার কোনো সুবিধা নেই।
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-lg border border-blue-500/30">
                      <h5 className="font-bold text-blue-400 text-xs mb-1">২. Shopify (High Subscription Software Tool):</h5>
                      <p className="text-slate-300">
                        শপিফাই কোনো মার্কেটপ্লেস নয়, এটি একটি সফটওয়্যার টুল। তাদের আয়ের প্রধান উৎস হলো প্রতি মাসে সর্বনিম্ন $৩৯ থেকে $৩৯৯ ডলার ফিক্সড সাবস্ক্রিপশন নেওয়া এবং কার্ড ট্রানজেকশনে ২.৯% ফি কাটা। শপিফাইতে স্টোর খোলার পর কোনো কাস্টমার বা অর্গানিক ট্রাফিক পাওয়া যায় না—মার্চেন্টকে নিজেকেই লাখ টাকা খরচ করে ফেসবুক বা গুগলে এডস চালিয়ে কাস্টমার আনতে হয়। ছোট উদ্যোক্তাদের জন্য মাসে $৩৯ ডলার (প্রায় ৪৮০০ টাকা) দেওয়া অত্যন্ত ব্যয়বহুল।
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-lg border border-emerald-500/30">
                      <h5 className="font-bold text-emerald-400 text-xs mb-1">৩. GecoPay (Hybrid Model + $1 Micro-Subscription + 3%-5% Commission):</h5>
                      <p className="text-slate-300">
                        <strong>গেম-চেঞ্জিং $১ ডলার মাইক্রো-সাবস্ক্রিপশন মডেল:</strong> শপিফাই-এর $৩৯ ডলারের বদলে GecoPay মাত্র <strong>$১ ডলার (বা ১০০ টাকা)/মাসিক সাবস্ক্রিপশন</strong> সার্ভিস চার্জ চার্জ করবে! এতে করে যেকোনো ক্ষুদ্র পেজ-ভিত্তিক সেলার বা স্টোর নিমিষে প্ল্যাটফর্মে যুক্ত হতে পারবে। ১০ লাখ মার্চেন্ট যুক্ত হলে প্রতি মাসে <strong>$১,০০,০০০ (১ মিলিয়ন ডলার) ফিক্সড রিঅ্যাকারিং রেভিনিউ (MRR)</strong> আসবে! এছাড়া ব্যবসা সফল হলে কেবল ৩% থেকে ৫% ফেয়ার ট্রানজেকশন ফি নেওয়া হবে। মার্চেন্ট শপিফাই-এর মতো নিজস্ব ব্র্যান্ডেড অনলাইন শপ ও পেমেন্ট লিংক পাবে, আবার আমাজনের মতো <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">gecopay.com</code> সেন্ট্রাল মার্কেটপ্লেস থেকে গ্লোবাল বায়িং ট্রাফিক ফ্রিতে পাবে। বিদেশি কাস্টমার যে কারেন্সিতেই পে করুক না কেন, মার্চেন্ট ১ সেকেন্ডে তার লোকাল বিকাশ, নগদ বা ব্যাংক অ্যাকাউন্টে টাকা পেয়ে যাবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 17: Amazon FBA vs GecoPay Decentralized 3PL Logistics Engine */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-sky-500/40">
                  <h4 className="font-bold text-sky-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-sky-500 text-slate-950 text-xs font-mono font-bold px-2 py-0.5 rounded">LOGISTICS ENGINE</span>
                    ১৭. Amazon FBA vs GecoPay Decentralized 3PL Delivery Engine Strategy
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300 leading-relaxed">
                    <div className="bg-slate-800/90 p-3 rounded-lg border border-amber-500/30">
                      <h5 className="font-bold text-amber-300 text-xs mb-1">১. আমাজনের ডেলিভারি সার্ভিস কীভাবে কাজ করে (Amazon FBA)?</h5>
                      <p className="text-slate-300">
                        আমাজনের সবচেয়ে বড় শক্তির জায়গা হলো তাদের <strong>FBA (Fulfillment by Amazon)</strong>। তাদের নিজস্ব হাজার হাজার বিশাল ওয়্যারহাউস, কার্গো বিমান, ডেলিভারি ট্রাক এবং 'Prime' ২-দিনের ফাস্ট ডেলিভারি ফ্লীট রয়েছে। মার্চেন্টরা তাদের প্রোডাক্ট আগেই আমাজনের ওয়্যারহাউসে পাঠিয়ে রাখে, আর অর্ডার আসলে আমাজন নিজ দায়িত্বে প্যাকেজিং ও ডেলিভারি করে। তবে এর বিনিময়ে আমাজন মার্চেন্টদের কাছ থেকে বিপুল পরিমাণ ওয়্যারহাউস স্টোরেজ ফি ও হ্যান্ডলিং চার্জ কাটে, যা ছোট ব্যবসায়ীদের পক্ষে সহ্য করা প্রায় অসম্ভব।
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-lg border border-sky-500/30">
                      <h5 className="font-bold text-sky-300 text-xs mb-1">২. GecoPay কীভাবে কোটি ডলার খরচ না করেই গ্লোবাল ডেলিভারি হ্যান্ডেল করবে?</h5>
                      <p className="text-slate-300">
                        GecoPay-কে আমাজনের মতো বিলিয়ন ডলার খরচ করে নিজস্ব ওয়্যারহাউস বা প্লেন কিনতে হবে না! GecoPay ব্যবহার করবে <strong>Decentralized 3PL API Network Integration Engine</strong>। বিশ্বমানের কুরিয়ার সার্ভিস (যেমন: DHL Express, FedEx, Aramex, ShipRocket) এবং লোকাল ডেলিভারি জায়ান্টদের (Steadfast, Pathao, RedX) API সরাসরি GecoPay-এর সাথে যুক্ত থাকবে।
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-lg border border-emerald-500/30">
                      <h5 className="font-bold text-emerald-400 text-xs mb-1">৩. GecoPay Auto-Delivery System-এর ৪-ধাপের অটোমেটেড প্রসেস:</h5>
                      <p className="text-slate-300">
                        <strong>১. Live Shipping Rates:</strong> কাস্টমার চেকআউটের সময় প্রোডাক্টের ওজন ও দেশের ওপর ভিত্তি করে সরাসরি কুরিয়ারের লাইভ ডেলিভারি চার্জ দেখবে।<br />
                        <strong>২. Automatic Pickup Dispatch:</strong> পেমেন্ট Escrow-তে হোল্ড হওয়ার সাথে সাথে GecoPay API কুরিয়ার কোম্পানিকে মার্চেন্টের শপ থেকে প্রোডাক্ট পিকআপের রিকোয়েস্ট পাঠিয়ে দেবে।<br />
                        <strong>৩. Real-time Tracking Webhook:</strong> মার্চেন্ট ও কাস্টমার উভয়েই প্যানেল থেকে লাইভ ম্যাপ ট্র্যাকিং দেখতে পাবে।<br />
                        <strong>৪. Auto Escrow Release:</strong> কুরিয়ার যখন সিস্টেমে "Delivered" কনফার্মেশন পাঠাবে, তখনই Escrow থেকে মার্চেন্টের ওয়ালেটে টাকা অটো-রিলিজ হয়ে যাবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 18: Global Growth Timeline & Forbes Top 10 Valuation Projections */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-purple-500/40">
                  <h4 className="font-bold text-purple-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-purple-500 text-white text-xs font-mono font-bold px-2 py-0.5 rounded">FORBES TOP 10 ROADMAP</span>
                    ১৮. Global Scale Timeline & Forbes Top 10 Valuation Projection (Amazon/Shopify Benchmark)
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300 leading-relaxed">
                    <div className="bg-slate-800/90 p-3 rounded-lg border border-purple-500/30">
                      <h5 className="font-bold text-purple-300 text-xs mb-1">১. আমাজন ও শপিফাইকে ক্রস করতে কত বছর সময় লাগবে (৩ থেকে ৫ বছরের মাস্টারপ্ল্যান)?</h5>
                      <p className="text-slate-300">
                        প্রথমে বাংলাদেশে MecoPay পুরোপুরি প্রতিষ্ঠিত করার পর, পরের ১-২ বছরে সাউথ এশিয়া, মিডল ইস্ট ও ল্যাটিন আমেরিকার মতো দ্রুত বর্ধনশীল বাজারে জেনুইন ইনফ্লুয়েন্সার (অভিনেত্রী/সেলিব্রিটি) ও প্ল্যাটফর্ম সোশ্যাল এডস দিয়ে প্রচার করলে <strong>৩ থেকে ৫ বছরের মধ্যে</strong> GecoPay গ্লোবালি শপিফাই ও আমাজনের বাজার শেয়ারে বড় রকমের ধাক্কা দিতে পারবে। কারণ শপিফাই-এর $৩৯ ডলারের জায়গায় মাত্র $১ ডলার সাবস্ক্রিপশন এবং লোকাল কারেন্সি উইথড্রয়াল মডেল কোটি কোটি উদীয়মান উদ্যোক্তাকে আকর্ষণ করবে।
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-lg border border-amber-500/30">
                      <h5 className="font-bold text-amber-300 text-xs mb-1">২. ক্যাশফ্লো ও ব্যাংকিং নিরাপত্তা (Tazapay + 3PL Network):</h5>
                      <p className="text-slate-300">
                        আমাদের এই মডেলে ব্যাংকিং ও ক্রস-বর্ডার লাইসেন্সিং-এর ঝামেলা Tazapay হ্যান্ডেল করবে এবং শিপিং ফি সরাসরি কাস্টমার পরিশোধ করবে। ফলে GecoPay-কে নিজের পকেট থেকে কোনো ভারী লজিস্টিক বা ব্যাংকিং ক্যাপিটাল খরচ করতে হবে না। পুরো বিজনেস স্ট্রাকচারটি একটি লাইটওয়েট, অত্যন্ত লাভজনক ও অটোমেটেড সফ্টওয়্যার ও ফিনটেক নেটওয়ার্ক হিসেবে কাজ করবে।
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-lg border border-emerald-500/30">
                      <h5 className="font-bold text-emerald-400 text-xs mb-1">৩. GecoPay-এর ওনার কি বিশ্বের সেরা ১০ ধনী ব্যক্তির (Forbes Top 10) তালিকায় যেতে পারবে?</h5>
                      <p className="text-slate-300">
                        <strong>হ্যাঁ, গাণিতিকভাবে এটি ১০০% সম্ভব!</strong> যদি GecoPay বিশ্বব্যাপী ১ কোটি (10 Million) মার্চেন্ট তৈরি করতে পারে, তবে কেবল $১ ডলার সাবস্ক্রিপশন থেকেই বার্ষিক $১২০ মিলিয়ন ডলার ফিক্সড ইনকাম আসবে। পাশাপাশি যদি বছর শেষে $২০০ বিলিয়ন ডলারের মার্চেন্ট ট্রানজেকশন (GMV) প্রসেস হয় এবং ৩% ফি নেওয়া হয়, তবে প্ল্যাটফর্মের বার্ষিক রেভিনিউ দাঁড়াবে $৬ বিলিয়ন (৬০০ কোটি ডলার)! টেক ও ফিনটেক মাল্টিপল (20x Valuation) অনুযায়ী GecoPay-এর কোম্পানির ভ্যালুয়েশন হবে <strong>$১২০ বিলিয়ন ডলার (120 Billion USD+)</strong>। এই ভ্যালুয়েশন অর্জিত হলে কোম্পানি ফাউন্ডার বা প্রধান ওনার সরাসরি <strong>বিশ্বের শীর্ষ ১০ জন ধনীর (Forbes Top 10 List)</strong> ক্লাবে স্থান করে নেবেন!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 19: Bangladesh First Launch Blueprint (Next.js + Supabase Stack, Dual Account Tracks) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-cyan-500/40">
                  <h4 className="font-bold text-cyan-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-cyan-500 text-slate-950 text-xs font-mono font-bold px-2 py-0.5 rounded">BD LAUNCH & TECH STACK</span>
                    ১৯. Bangladesh Execution Blueprint: Next.js + Supabase Core Engine (Merchant API & Personal Tracks)
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300 leading-relaxed">
                    <p className="leading-relaxed bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <strong>বাংলাদেশ টেকনিক্যাল আর্কিটেকচার (Next.js + Supabase):</strong> প্রথমে বাংলাদেশে MecoPay রোলআউট করার জন্য আমরা <strong>Next.js + Supabase</strong> টেক স্ট্যাক ব্যবহার করব। n8n AI বট মডিউলটি পরবর্তীতে সিঙ্ক হিসেবে যুক্ত হবে। ব্যবহারকারীদের জন্য ড্যাশবোর্ড এবং মূল ওয়েবসাইটে ২টি ওপেন অ্যাকাউন্ট অপশন রাখা হবে:
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      {/* Track 1: Merchant Account & API */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-cyan-500/30 space-y-1.5">
                        <strong className="text-cyan-300 block text-xs font-bold">১. Merchant API Gateway Track (For Custom Websites):</strong>
                        <ul className="list-disc pl-3 space-y-1 text-slate-300 text-[11px]">
                          <li><strong>Open Web Access:</strong> ক্লায়েন্টরা সরাসরি ওয়েবসাইট থেকে মার্চেন্ট হিসেবে সাইন-আপ করতে পারবে।</li>
                          <li><strong>Supabase API Key Engine:</strong> ড্যাশবোর্ডে প্রবেশের সাথেই Supabase ব্যাকএন্ড থেকে Secret API Key (<code className="text-amber-300">mec_sec_live_99x...</code>) এবং Publishable Key তৈরি হয়ে যাবে।</li>
                          <li><strong>Custom Web Integration:</strong> ক্লায়েন্টরা তাদের নিজস্ব কাস্টম ই-কমার্স ওয়েবসাইটে (Next.js/React/WooCommerce) API দিয়ে MecoPay Gateway বসিয়ে কাস্টমারদের কাছ থেকে সরাসরি অনলাইন পেমেন্ট নিবে।</li>
                          <li><strong>Instant Payment Links:</strong> যাদের ওয়েবসাইট নেই, তারা ম্যানুয়ালি ইনস্ট্যান্ট পেমেন্ট লিংক বানিয়ে ফেসবুক মেসেঞ্জারে পেমেন্ট কালেকশন করতে পারবে।</li>
                        </ul>
                      </div>

                      {/* Track 2: Personal Account Track */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-indigo-500/30 space-y-1.5">
                        <strong className="text-indigo-300 block text-xs font-bold">২. Personal Account Track (Individual/Freelancers):</strong>
                        <ul className="list-disc pl-3 space-y-1 text-slate-300 text-[11px]">
                          <li><strong>Personal Pay Link:</strong> ফ্রিল্যান্সার বা পার্সোনাল সেলারদের জন্য পার্সোনাল অ্যাকাউন্ট সিস্টেম।</li>
                          <li><strong>Unique URL:</strong> নিজের পছন্দমতো পার্সোনাল পে লিঙ্ক (<code className="text-emerald-300">mecopay.com/pay/rahim</code>) বানিয়ে টাকা গ্রহণ করা যাবে।</li>
                          <li><strong>Seamless Upgrade:</strong> যেকোনো সময় ১-ক্লিকে পার্সোনাল অ্যাকাউন্ট থেকে মার্চেন্ট অ্যাকাউন্টে সুইচ করে কাস্টম ওয়েবসাইটের API Key আনলক করা যাবে।</li>
                        </ul>
                      </div>
                    </div>

                    {/* Banking & Delivery Strategy */}
                    <div className="bg-slate-800/90 p-3 rounded-lg border border-emerald-500/30">
                      <strong className="text-emerald-400 block text-xs mb-1 font-bold">৩. Local BD Revenue Collection & Global Scaling Strategy:</strong>
                      <p className="text-slate-300">
                        <strong>MecoPay Fee Collection:</strong> প্রাথমিক অবস্থায় আমরা লোকাল বিকাশ/নগদ/ব্যাংক অ্যাকাউন্টের মাধ্যমে মার্চেন্টদের কাছ থেকে সাবস্ক্রিপশন ও সার্ভিস ফি কালেকশন করব।<br />
                        <strong>Modular Add-on:</strong> Next.js + Supabase ব্যাকএন্ড প্রস্তুত হওয়ার পর n8n AI সোশ্যাল চ্যাটবটটি প্লাগ-ইন হিসেবে পরবর্তীতে কানেক্ট করা হবে। গ্লোবাল স্কেলিংয়ের সময় ব্যাকএন্ডে Tazapay ও 3PL লজিস্টিক এপিআই যুক্ত হয়ে পুরো সিস্টেমটি অটোমেটেড হয়ে যাবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 20: Multi-Website AI Agent (n8n + Gemini AI Omnichannel E-commerce Engine) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-pink-500/40">
                  <h4 className="font-bold text-pink-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-pink-500 text-slate-950 text-xs font-mono font-bold px-2 py-0.5 rounded">AI AGENT ENGINE</span>
                    ২০. Unlimited Multi-Website Omnichannel AI Agent (n8n + Gemini) with Product Catalog Intelligence
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300 leading-relaxed">
                    <p className="leading-relaxed bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <strong>আনলিমিটেড ওয়েবসাইট ও সোশ্যাল চ্যানেল AI ইন্টিগ্রেশন:</strong> মার্চেন্টরা তাদের ড্যাশবোর্ড থেকে যত খুশি কাস্টম ওয়েবসাইট যুক্ত করতে পারবে। প্রতিটি ওয়েবসাইটের জন্য Facebook Messenger, WhatsApp Business, Telegram এবং Instagram DM চ্যানেল কানেক্ট করে AI সেলস এজেন্ট চালু রাখা যাবে।
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      {/* Sub-point 1: Website Product Sync */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-pink-500/30 space-y-1.5">
                        <strong className="text-pink-300 block text-xs font-bold">১. Live Website Product Catalog AI Sync:</strong>
                        <ul className="list-disc pl-3 space-y-1 text-slate-300 text-[11px]">
                          <li><strong>Website-Specific Knowledge:</strong> n8n + Gemini AI এজেন্ট সরাসরি নির্দিষ্ট ওয়েবসাইটের প্রোডাক্ট ক্যাটালগ (ছবি, দাম, স্টক, সাইজ, ডিসকাউন্ট) প্রতিনিয়ত রিয়েল-টাইমে সিঙ্ক করে রাখবে।</li>
                          <li><strong>Intelligent Q&A:</strong> কাস্টমার মেসেঞ্জারে বা হোয়াটসঅ্যাপে প্রোডাক্ট নিয়ে প্রশ্ন করলে (যেমন: "এই জামাটার L সাইজ আছে? দাম কত?") AI এজেন্ট সরাসরি ওই ওয়েবসাইটের ডাটাবেজ থেকে নিখুঁত উত্তর দেবে।</li>
                        </ul>
                      </div>

                      {/* Sub-point 2: Auto Payment Link in Chat */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-amber-500/30 space-y-1.5">
                        <strong className="text-amber-300 block text-xs font-bold">২. Instant In-Chat Payment & Order Placement:</strong>
                        <ul className="list-disc pl-3 space-y-1 text-slate-300 text-[11px]">
                          <li><strong>Dynamic MecoPay Link Generation:</strong> কাস্টমার অর্ডার দিতে চাইলে AI এজেন্ট চ্যাটের মধ্যেই ১-সেকেন্ডে অটোমেটিক MecoPay Checkout Link বা QR Code তৈরি করে দেবে।</li>
                          <li><strong>Zero Human Friction:</strong> কাস্টমার মেসেঞ্জার/হোয়াটসঅ্যাপ চ্যাট না ছেড়েই লিংকে ক্লিক করে বিকাশ/নগদ/কার্ডে পেমেন্ট সম্পন্ন করবে, এবং ওয়েবহুকের মাধ্যমে ওয়েবসাইটের ইনভেন্টরি অটো-আপডেট হয়ে যাবে।</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 21: Monetization Tiers (Basic $1 vs Pro AI Tier $9-$19/mo) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-amber-500/40">
                  <h4 className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 text-xs font-mono font-bold px-2 py-0.5 rounded">PRO TIER MONETIZATION</span>
                    ২১. Pro Tier Monetization Strategy: $1 Starter vs $9-$19/mo Pro Omnichannel AI
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300 leading-relaxed">
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      {/* Starter Tier */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1">
                        <strong className="text-slate-200 block text-xs font-bold">১. $১ Starter Plan (Basic Merchant):</strong>
                        <p className="text-[11px] text-slate-300">
                          ১টি প্রধান স্টোর লিঙ্ক, বেসিক API অ্যাক্সেস, ম্যানুয়াল পেমেন্ট লিংক জেনারেটর, স্ট্যান্ডার্ড ৩%-৫% ট্রানজেকশন ফি। সকল ক্ষুদ্র ও মাঝারি পেজ সেলারদের জন্য এন্ট্রি লেভেল সমাধান।
                        </p>
                      </div>

                      {/* Pro Tier */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-amber-500/50 space-y-1">
                        <strong className="text-amber-300 block text-xs font-bold">২. $৯ - $১৯/mo Pro Plan (AI Omnichannel Automation):</strong>
                        <p className="text-[11px] text-slate-300">
                          আনলিমিটেড কাস্টম ওয়েবসাইট সোপার্ট, n8n + Gemini AI Omnichannel Agent (Messenger, WhatsApp, Telegram, Instagram DM), অটোমেটিক ইন-চ্যাট অর্ডার প্রসেসিং, লাইভ ইনভেন্টরি সিঙ্ক। এটি প্ল্যাটফর্মের প্রফিট মার্জিনকে ৫X বাড়িয়ে দেবে!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 22: Strategic Analysis: Beating Amazon & Shopify Without Owning Warehouses */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-emerald-500/40">
                  <h4 className="font-bold text-emerald-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 text-xs font-mono font-bold px-2 py-0.5 rounded">FEASIBILITY ANALYSIS</span>
                    ২২. Strategic Analysis: Can GecoPay Defeat Amazon & Shopify Without Owning Warehouses?
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300 leading-relaxed">
                    <div className="bg-slate-800/90 p-3 rounded-lg border border-emerald-500/30">
                      <h5 className="font-bold text-emerald-300 text-xs mb-1">১. Asset-Light Model (Uber/Airbnb Strategy for E-Commerce):</h5>
                      <p className="text-slate-300">
                        <strong>হ্যাঁ, সম্পূর্ণ সম্ভব!</strong> উবার (Uber) যেমন একটি গাড়ি না কিনেও বিশ্বের সবচেয়ে বড় ট্যাক্সি কোম্পানি, বা এয়ারবিএনবি (Airbnb) একটি হোটেল না কিনেও বিশ্বের বড় হোটেল চেইন—ঠিক তেমনি GecoPay একটি নিজস্ব ওয়্যারহাউস বা প্লেন না বানিয়েও বিশ্বের সবচেয়ে বড় ই-কমার্স নেটওয়ার্ক হতে পারে। আমাজনের কোটি কোটি ডলার লজিস্টিক ও ওয়্যারহাউস মেইনটেন্যান্সে ডেট (ঋণ) নিতে হয়; পক্ষান্তরে GecoPay 3PL (DHL, FedEx, Steadfast) API ব্যবহার করে <strong>০% ক্যাপিটাল এক্সপেন্স (CapEx)</strong> দিয়ে আনলিমিটেড স্কেল করতে পারবে।
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-lg border border-cyan-500/30">
                      <h5 className="font-bold text-cyan-300 text-xs mb-1">২. ১০ গুণ মূল্যের সুবিধা (Shopify Killer Advantage):</h5>
                      <p className="text-slate-300">
                        শপিফাই-এ স্টোর চালাতে মাসে $৩৯-$৩৯৯ ডলার সাবস্ক্রিপশন + $৫০ ডলারের AI বট অ্যাপ কিনতে হয় (মোট $১০০+/মাস)। অন্যদিকে GecoPay মাত্র $১ ডলার Starter এবং $৯-$১৯ ডলারে বিল্ট-ইন AI Omnichannel এজেন্ট দেয়। এশিয়া, ল্যাটিন আমেরিকা ও আফ্রিকার ৯০% ক্ষুদ্র ও মাঝারি সেলার শপিফাই ছেড়ে GecoPay-তে শিফট হতে বাধ্য হবে!
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-lg border border-purple-500/30">
                      <h5 className="font-bold text-purple-300 text-xs mb-1">৩. Social & Conversational Commerce-এ আধিপত্য (Amazon Killer Advantage):</h5>
                      <p className="text-slate-300">
                        আমাজনে কাস্টমারকে ওয়েবসাইটে এসে সার্চ করে কিনতে হয়। কিন্তু বর্তমান বিশ্বের ৭০% ই-কমার্স সেলস হচ্ছে সোশ্যাল মিডিয়া (Messenger, WhatsApp, Instagram DM)-তে চ্যাটিংয়ের মাধ্যমে। GecoPay-এর AI এজেন্ট চ্যাটের মধ্যেই গ্রাহকদের সাথে কথা বলে পেমেন্ট লিংক দিয়ে মুহূর্তেই অর্ডার কনফার্ম করে ফেলে। যেখানে আমাজন ও শপিফাই পৌঁছাতে পারে না, সেখানে GecoPay সোশ্যাল মিডিয়ায় সরাসরি আধিপত্য বিস্তার করবে।
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-lg border border-amber-500/30">
                      <h5 className="font-bold text-amber-300 text-xs mb-1">৪. চূড়ান্ত সিদ্ধান্ত (Conclusion):</h5>
                      <p className="text-slate-300 font-medium">
                        নিজস্ব ওয়্যারহাউস না থেকেও 3PL ডেলিভারি এপিআই + Tazapay ফিনটেক + $১ ডলার সাবস্ক্রিপশন + Omnichannel AI এজেন্টের কম্বিনেশনে GecoPay শপিফাই ও আমাজনকে অনায়াসে টেক্কা দিতে পারবে এবং ফাউন্ডারকে গ্লোবাল টপ ১০ রিচেস্ট ক্লাবে পৌঁছে দিতে পারবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 23: Bangladesh Initial Marketing Strategy (GTM) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-rose-500/40">
                  <h4 className="font-bold text-rose-300 text-sm mb-1 flex items-center gap-2">
                    <span className="bg-rose-500 text-white text-xs font-mono font-bold px-2 py-0.5 rounded">GTM MARKETING BLUEPRINT</span>
                    ২৩. Bangladesh Initial Go-To-Market (GTM) & Low-Cost Marketing Strategy
                  </h4>

                  <div className="space-y-3 mt-2 text-xs text-slate-300 leading-relaxed">
                    <p className="leading-relaxed bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <strong>শুরুতে বাংলাদেশে কীভাবে কম খরচে সর্বোচ্চ মার্চেন্ট আনা সম্ভব (Low-Cost Viral Marketing):</strong> বাংলাদেশে বর্তমানে ৫ লাখের বেশি সক্রিয় ফেসবুক পেজ ভিত্তিক ই-কমার্স (F-Commerce) এবং হাজার হাজার কাস্টম ওয়েবসাইট ওনার রয়েছে। তাদের কাছে পৌঁছাতে ৪-ধাপের বিশেষ মার্কেটিং স্ট্র্যাটেজি:
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      {/* Growth Hack 1 */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-rose-500/30 space-y-1">
                        <strong className="text-rose-300 block text-xs font-bold">১. "৳১০০ টাকায় নিজের পেমেন্ট গেটওয়ে" হাইলাইট ক্যাম্পেইন:</strong>
                        <p className="text-[11px] text-slate-300">
                          শপিফাই-এর ৪৮০০ টাকা বা লোকাল গেটওয়ের ২০,০০০ টাকা সেটআপ ফি-এর বিপরীতে <strong>"মাত্র ১০০ টাকায় ( $১ ) নিজের বিকাশের মতো ইনস্ট্যান্ট পেমেন্ট গেটওয়ে"</strong> স্লোগান দিয়ে ফেসবুক ও ইনস্টাগ্রামে টার্গেটেড ভিডিও এডস এবং রিলস চালানো।
                        </p>
                      </div>

                      {/* Growth Hack 2 */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-cyan-500/30 space-y-1">
                        <strong className="text-cyan-300 block text-xs font-bold">২. Developer & F-Commerce Facebook Group Growth:</strong>
                        <p className="text-[11px] text-slate-300">
                          <em>F-Commerce Alliance, E-Commerce Bangladesh, WordPress/WooCommerce Bangladesh</em> এবং <em>DevsBD</em> ফেসবুক গ্রুপগুলোতে কীভাবে ২ মিনিটে ওয়েবসাইট বা ফেসবুক পেজে MecoPay পেমেন্ট লিঙ্ক বসানো যায় তা নিয়ে ফ্রি ভিডিও ও টিউটোরিয়াল পোস্ট করা।
                        </p>
                      </div>

                      {/* Growth Hack 3 */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-emerald-500/30 space-y-1">
                        <strong className="text-emerald-300 block text-xs font-bold">৩. Tech Creator & E-Commerce Mentor Sponsorship:</strong>
                        <p className="text-[11px] text-slate-300">
                          বাংলাদেশের যেসব জনপ্রিয় ইউটিউবার এবং মেন্টরদের ই-কমার্স কোর্স ও টেকনোলজি টিউটোরিয়াল চ্যানেল রয়েছে, তাদেরকে দিয়ে "How to accept online payments with MecoPay" রিভিউ টিউটোরিয়াল বানানো।
                        </p>
                      </div>

                      {/* Growth Hack 4 */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-amber-500/30 space-y-1">
                        <strong className="text-amber-300 block text-xs font-bold">৪. Viral "Powered by MecoPay" Growth Loop:</strong>
                        <p className="text-[11px] text-slate-300">
                          প্রতিটি মার্চেন্টের পেমেন্ট লিঙ্ক ও চেকআউট পেজের নিচে <code>Powered by MecoPay | Get yours for ৳100</code> ব্যাজ থাকবে। যখন ১,০০০০ কাস্টমার কেনাকাটা করবে, তারা এই লিংকে ক্লিক করে নিজেরা মার্চেন্ট হিসেবে সাইন আপ করবে (অর্গানিক ভাইরাল লুপ)!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Quality Control & Security */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            4. Quality Control & Scaling Checks
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2"><Database className="w-4 h-4 text-slate-500" /> RLS Security</h4>
              <p className="text-sm text-slate-600">Ensure Supabase Row Level Security is ON. Customers can only read transactions matching their specific session ID, preventing data leaks.</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2"><Globe className="w-4 h-4 text-slate-500" /> Cloudflare Edge</h4>
              <p className="text-sm text-slate-600">Frontend is hosted globally on Cloudflare Pages. Supabase natively scales PostgreSQL. This architecture handles millions of requests seamlessly.</p>
            </div>
          </div>
        </section>

        {/* Section: Future Extensions */}
        <section className="bg-slate-900 rounded-3xl shadow-lg p-8 md:p-10 text-white">
          <h2 className="text-2xl font-bold mb-6">5. Future Roadmap & Reseller Hosting (Phase 2 & 3)</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="bg-blue-500/20 p-2 rounded-lg"><Code2 className="w-5 h-5 text-blue-400" /></div>
              <div>
                <h4 className="font-bold text-white mb-1">Built-in Website & Post Builder (Phase 2)</h4>
                <p className="text-sm text-slate-400">Initially, users can create standard landing pages or posts directly within your platform (like a built-in Blogger). They can use simple text/images or inject custom HTML/CSS code. These pages will run under your platform's domain (e.g., yoursite.com/user-shop) as their backend.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="bg-purple-500/20 p-2 rounded-lg"><Globe className="w-5 h-5 text-purple-400" /></div>
              <div>
                <h4 className="font-bold text-white mb-1">Reseller Hosting & Custom Domains (Phase 3)</h4>
                <p className="text-sm text-slate-400"><strong>This is where you scale:</strong> Allow users to attach their own custom domains (e.g., theirshop.com) to the websites they built on your platform. You act as a "Reseller Host"—meaning you provide the storage and backend processing power on your cloud infrastructure, giving them a fully professional, standalone website experience while they pay you for the setup and hosting.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="bg-emerald-500/20 p-2 rounded-lg"><Zap className="w-5 h-5 text-emerald-400" /></div>
              <div>
                <h4 className="font-bold text-white mb-1">AI Landing Page Generator (Phase 3)</h4>
                <p className="text-sm text-slate-400">A simplified interface where clients upload product details, and AI generates an animated, conversion-optimized landing page with your Checkout/Buy Now buttons seamlessly integrated.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
