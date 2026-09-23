import React from 'react';
import { ArrowLeft, ShieldCheck, ShieldAlert, FileText, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const LegalLayout = ({ title, icon: Icon, children, lastUpdated }: any) => (
  <div className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-blue-500/30">
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <Link to="/login" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-10 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        হোম পেজে ফিরে যান
      </Link>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white">{title}</h1>
          <p className="text-neutral-500 mt-2">সর্বশেষ আপডেট: {lastUpdated}</p>
        </div>
      </div>
      
      <div className="prose prose-invert prose-blue max-w-none prose-headings:text-white prose-p:leading-relaxed prose-li:leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

export const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy" icon={ShieldCheck} lastUpdated="৩ আগস্ট ২০২৬">
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">১.১. আমরা কী কী তথ্য সংগ্রহ করি</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>পরিচয়পত্র ও প্রমাণ:</strong> আপনার জাতীয় পরিচয়পত্র (NID) নম্বর, NID-এর ছবি, জন্ম নিবন্ধন (Birth Certificate) নম্বর, জন্ম নিবন্ধনের ছবি এবং আপনার পাসপোর্ট সাইজের ছবি।</li>
          <li><strong>যোগাযোগের তথ্য:</strong> ফোন নম্বর, নাম এবং ইমেইল অ্যাড্রেস।</li>
          <li><strong>ট্রানজেকশন ডেটা:</strong> পেমেন্ট লিংক, ইনভয়েস এবং ট্রানজেকশন স্ট্যাটাস।</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">১.২. টু-ফ্যাক্টর অথেনটিকেশন (2FA) এবং অ্যাকাউন্ট সুরক্ষা</h2>
        <p>MecoPay-তে অ্যাকাউন্ট সুরক্ষার জন্য কোনো সনাতন ইমেইল ও পাসওয়ার্ড দিয়ে সরাসরি অ্যাকাউন্ট খোলার ব্যবস্থা রাখা হয়নি। আপনাকে কেবল Google Account (গুগল সাইন-ইন) যুক্ত সুরক্ষিত ডিভাইসের মাধ্যমে এক্সেস নিতে হবে।</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>অ্যাক্সেস ও 2-Step ভেরিফিকেশন সুরক্ষা:</strong> আমাদের প্ল্যাটফর্মে গুগল সাইন-ইন করার পর আপনি 2-Step Verification (TOTP) সক্রিয় করতে পারবেন। কোনো অনাকাঙ্ক্ষিত পরিস্থিতিতে যদি কেউ আপনার জিমেইল অ্যাকাউন্ট হ্যাক করে ফেলে বা আপনার জিমেইল পাসওয়ার্ড জেনেও ফেলে, তবুও আপনার Google Authenticator-এর ৬ ডিজিটের ভেরিফিকেশন কোড ছাড়া অন্য কারো পক্ষে আপনার MecoPay অ্যাকাউন্টে প্রবেশ করা সম্ভব হবে না।</li>
          <li><strong>বায়োমেট্রিক রিকমেন্ডেশন:</strong> আপনার অ্যাকাউন্টকে সম্পূর্ণ সুরক্ষিত রাখতে আমরা 2-Step Verification-এর ক্ষেত্রে ফিঙ্গারপ্রিন্ট (Fingerprint) বা বায়োমেট্রিক অপশন ব্যবহারের জন্য জোরালো সুপারিশ করছি। এটি অননুমোদিত অ্যাক্সেস শতভাগ প্রতিরোধ করবে।</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">১.৩. সিঙ্গেল অ্যাকাউন্ট এবং পার্মানেন্ট লক পলিসি</h2>
        <p>আমাদের প্ল্যাটফর্মে একজন ব্যক্তির তথ্য দিয়ে কেবল একটি অ্যাকাউন্টই খোলা সম্ভব। লগইন প্রোফাইলে আইডেন্টিটি ভেরিফিকেশনের জন্য দুটি অপশন থাকে (১৮ বছরের নিচে বা ১৮ বছরের উপরে):</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>১৮ বছরের উপরে:</strong> NID এবং জন্ম নিবন্ধন (Birth Certificate) উভয়ের তথ্য ও ছবি প্রদান <strong>বাধ্যতামূলক</strong>। একবার প্রোফাইল ভেরিফাই করা হলে, এই ডকুমেন্টগুলো সিস্টেমে পার্মানেন্টলি লক (Permanent Lock) হয়ে যাবে। এরপর প্রোফাইল আপগ্রেড বা পরিবর্তন করার কোনো সুযোগ থাকবে না।</li>
          <li><strong>১৮ বছরের নিচে:</strong> শুধুমাত্র জন্ম নিবন্ধনের তথ্য ও ছবি প্রদান করে অ্যাকাউন্ট ভেরিফাই করা যাবে। এই ক্ষেত্রে পরবর্তীতে NID আপডেট করার (আপগ্রেড) সুযোগ থাকবে, তবে জন্ম নিবন্ধন তথ্যটি পার্মানেন্টলি লক থাকবে।</li>
          <li><strong>সতর্কতা:</strong> আপনার বয়স যদি জন্ম সনদ অনুযায়ী ১৮ বছরের উপরে হয়, কিন্তু আপনি NID প্রদান এড়ানোর জন্য '১৮ বছরের নিচে' সিলেক্ট করেন বা NID না দেন, তবে আপনার অ্যাকাউন্ট ভেরিফাই হবে না এবং আমরা অ্যাকাউন্টটি ব্লক করে দেব। একই ডকুমেন্ট দিয়ে দ্বিতীয় কোনো অ্যাকাউন্ট খোলার চেষ্টা করলে তা স্বয়ংক্রিয়ভাবে বাতিল বলে গণ্য হবে।</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">১.৪. ইন্টারন্যাশনাল ব্যাংক-লেভেল সিকিউরিটি</h2>
        <p>আমরা গ্রাহকদের তথ্যের নিরাপত্তায় কোনো আপস করি না। আপনার তথ্য সম্পূর্ণ সুরক্ষিত রাখতে MecoPay <strong>ইন্টারন্যাশনাল ব্যাংক-লেভেল সিকিউরিটি (International Bank-Level Security)</strong> মেইনটেইন করে। আমরা একটি মাল্টি-লেয়ার সিকিউরিটি সিস্টেম ব্যবহার করি:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>ফ্রন্টএন্ড সিকিউরিটি (Cloudflare):</strong> বিশ্বের অন্যতম সেরা Cloudflare নেটওয়ার্কের মাধ্যমে আমাদের ফ্রন্টএন্ড এবং API ট্রাফিক এনক্রিপ্টেড এবং DDoS অ্যাটাক থেকে সুরক্ষিত থাকে।</li>
          <li><strong>ব্যাকএন্ড সিকিউরিটি (Row Level Security - RLS):</strong> আমাদের ডাটাবেস সম্পূর্ণভাবে Row Level Security (RLS) দ্বারা নিয়ন্ত্রিত। এর মানে হলো, আপনার অ্যাকাউন্টের ডাটা শুধুমাত্র আপনিই দেখতে পারবেন, অন্য কারো পক্ষে আপনার ডাটাবেস এক্সেস করা গাণিতিকভাবে অসম্ভব।</li>
          <li><strong>এন্ড-টু-এন্ড এনক্রিপশন:</strong> অ্যান্ড্রয়েড অ্যাপ এবং সার্ভারের প্রতিটি কানেকশন HMAC SHA-256 সিগনেচার দিয়ে সিকিউর করা থাকে, যা ডাটা লিকেজ বা ম্যান-ইন-দ্য-মিডল অ্যাটাক প্রতিরোধ করে।</li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">১.৫. যোগাযোগ</h2>
        <p>এই প্রাইভেসি পলিসি সম্পর্কে আপনার কোনো প্রশ্ন থাকলে, অনুগ্রহ করে support@mecopay.com-এ আমাদের সাথে যোগাযোগ করুন।</p>
      </section>
    </div>
  </LegalLayout>
);

export const TermsConditions = () => (
  <LegalLayout title="Terms & Conditions" icon={FileText} lastUpdated="৩ আগস্ট ২০২৬">
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">২.১. সার্ভিসের বিবরণ</h2>
        <p>MecoPay একটি অল-ইন-ওয়ান (All-in-One) ই-কমার্স স্যাস (SaaS) প্ল্যাটফর্ম, যা <strong>Innovative Education & Technology (IET)</strong>-এর একটি বিশেষ উদ্যোগ। এটি মার্চেন্ট এবং কাস্টমারদের মধ্যে লেনদেন স্বয়ংক্রিয় করার একটি অত্যাধুনিক পেমেন্ট অটোমেশন ও সমন্বিত ই-কমার্স ইকোসিস্টেম।</p>
        <p className="mt-3">MecoPay সরাসরি কাস্টমার থেকে মার্চেন্টের অ্যাকাউন্টে পেমেন্ট প্রসেস ও ভেরিফাই করতে সাহায্য করে এবং আমরা কোনো কাস্টমার বা মার্চেন্টের টাকা/পেমেন্ট নিজেদের কাছে হোল্ড বা জমা রাখি না।</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">২.২. অটো-রাউটিং এবং ট্রানজেকশন লিমিট</h2>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>পার্সোনাল MFS:</strong> ইউজাররা তাদের পার্সোনাল মোবাইল ব্যাংকিং অ্যাকাউন্ট ব্যবহার করতে পারবেন। সিস্টেমে সর্বোচ্চ ২টি পার্সোনাল নাম্বার সেট করা যাবে। প্রথম নাম্বারের দৈনিক বা মাসিক লিমিট শেষ হলে সিস্টেম স্বয়ংক্রিয়ভাবে দ্বিতীয় নাম্বারে পেমেন্ট রাউট করবে। আমাদের প্ল্যাটফর্ম থেকে কোনো লিমিটেশন নেই, MFS এর অফিশিয়াল ডেটা অনুযায়ী আমরা এটি সেট করেছি।</li>
          <li><strong>মার্চেন্ট API:</strong> পার্সোনাল অ্যাকাউন্টের লিমিটের চেয়ে বেশি ভলিউমের ট্রানজেকশন প্রয়োজন হলে ইউজারকে অবশ্যই মার্চেন্ট API সেট করতে হবে।</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">২.৩. দায়বদ্ধতার সীমাবদ্ধতা (Limitation of Liability)</h2>
        <p>ইউজারের পার্সোনাল MFS অ্যাকাউন্টে অতিরিক্ত ট্রানজেকশন বা অটো-রাউটিং ব্যবহারের কারণে সংশ্লিষ্ট মোবাইল ব্যাংকিং কর্তৃপক্ষ (যেমন: বিকাশ, নগদ, রকেট) যদি ইউজারের অ্যাকাউন্ট সাময়িক বা স্থায়ীভাবে লিমিট, ব্লক বা সাসপেন্ড করে, তবে এর সম্পূর্ণ দায়ভার ইউজারের। এরপরও যদি কোনো ক্লায়েন্টের পার্সোনাল অ্যাকাউন্ট ব্লক বা ব্যান করে MFS, এতে আমাদের কোনো দায় থাকবে না। MecoPay এর জন্য কোনোভাবেই আইনি বা আর্থিকভাবে দায়ী থাকবে না।</p>
      </section>
    </div>
  </LegalLayout>
);

export const RefundPolicy = () => (
  <LegalLayout title="রিফান্ড পলিসি (Refund Policy)" icon={RefreshCcw} lastUpdated="৩ আগস্ট ২০২৬">
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">১. সাবস্ক্রিপশন রিফান্ড</h2>
        <p>MecoPay ইউজারদের (ক্লায়েন্ট) জন্য ফ্রি ট্রায়ালের সুবিধা প্রদান করে, যাতে তারা সার্ভিসটি ভালোভাবে যাচাই করে নিতে পারেন। তাই পেইড সাবস্ক্রিপশন (যেমন: Basic, Pro) শুরু হওয়ার পর সাধারণত সাবস্ক্রিপশন ফি অফেরতযোগ্য (Non-refundable)।</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">২. রিফান্ডের ক্ষেত্রে ক্লায়েন্টের জন্য জিরো চার্জ (Zero Charge for Clients on Refund)</h2>
        <p>কাস্টমার স্যাটিসফ্যাকশন এবং ক্লায়েন্টদের ব্যবসার সুরক্ষায় আমরা প্রতিশ্রুতিবদ্ধ। কোনো কাস্টমার যদি প্রোডাক্ট রিটার্ন করেন বা কোনো কারণে অ্যাডভান্স পেমেন্ট রিফান্ড চান, তবে ক্লায়েন্ট (মার্চেন্ট) অবশ্যই কাস্টমারকে তার সম্পূর্ণ অগ্রিম টাকা ফেরত দিতে বাধ্য থাকবেন।</p>
        <p className="mt-4">এই রিফান্ড প্রক্রিয়ার ক্ষেত্রে ক্লায়েন্টের যেন কোনো আর্থিক ক্ষতি না হয়, তাই পেমেন্ট বা অ্যাডভান্স ভেরিফাই করার সময় MecoPay যে ট্রানজেকশন বা সার্ভিস চার্জটি নিয়েছিল, তা ক্লায়েন্টের কাছ থেকে আর কাটা হবে না বা মওকুফ করে দেওয়া হবে। অর্থাৎ, ট্রানজেকশন রিফান্ড হলে MecoPay-এর সার্ভিস চার্জটিও ক্লায়েন্টকে ছাড় দেওয়া হবে।</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">৩. ব্যতিক্রমী ক্ষেত্র (Exceptional Cases)</h2>
        <p>নিচের বিশেষ ক্ষেত্রগুলোতে MecoPay-এর সাবস্ক্রিপশন ফি রিফান্ড বিবেচনা করা হতে পারে:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>আমাদের সিস্টেমের কোনো টেকনিক্যাল ত্রুটির কারণে ডাবল বিলিং (Double Billing) হলে।</li>
          <li>সিস্টেমে দীর্ঘমেয়াদী অপ্রত্যাশিত আউটেজ বা ডাউনটাইম থাকলে।</li>
        </ul>
        <p className="text-neutral-500 mt-4 italic">(নোট: থার্ড-পার্টি মোবাইল ব্যাংকিং প্রোভাইডার যেমন বিকাশ, নগদ ইত্যাদির নিজস্ব সার্ভার ডাউনের কারণে কোনো বিলম্ব হলে তা এই শর্তের আওতাভুক্ত হবে না)।</p>
      </section>
    </div>
  </LegalLayout>
);


export const CustomerRightsAndAntiFraud = () => (
  <LegalLayout title="Anti-Fraud & Customer Rights Policy" icon={ShieldCheck} lastUpdated="৩ আগস্ট ২০২৬">
    <div className="space-y-8">
      <section>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-6">
          <div className="flex gap-4">
            <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
            <div className="text-sm text-red-200">
              <p className="font-bold text-red-400 mb-2 text-base">জিরো-টলারেন্স অ্যান্টি-ফ্রড পলিসি</p>
              <p>আমরা কাস্টমারদের অধিকার রক্ষায় জিরো-টলারেন্স নীতি মেনে চলি। MecoPay-এর পেমেন্ট চেকআউট পেজে একটি সরাসরি <strong>'রিপোর্ট' (Report)</strong> বাটন রয়েছে। কাস্টমার প্রতারিত হলে এই বাটনের মাধ্যমে প্রমাণাদিসহ সরাসরি আমাদের কাছে অভিযোগ জানাতে পারবেন।</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">১. ডেলিভারি যাচাইকরণ প্রক্রিয়া</h2>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>ফিজিক্যাল প্রোডাক্ট (Physical Products):</strong> ক্লায়েন্ট কাস্টম ওয়েবসাইট বা আমাদের নো-কোড ওয়েবসাইট (No-code website) সিস্টেম ব্যবহার করুক না কেন, ফিজিক্যাল প্রোডাক্টের ক্ষেত্রে ডেলিভারি API (কুরিয়ার এপিআই) কানেক্ট করা বাধ্যতামূলক। আমাদের মাদার ব্যাকএন্ড সরাসরি কুরিয়ার এপিআই থেকে ডেটা রিড করে রিয়েল-টাইমে যাচাই করবে যে প্রোডাক্ট কাস্টমারের কাছে সফলভাবে ডেলিভারি হয়েছে কিনা।</li>
          <li><strong>ডিজিটাল প্রোডাক্ট (Digital Products):</strong> ডিজিটাল প্রোডাক্ট বা সার্ভিসের ক্ষেত্রে অভিযোগ আসলে, আমরা উভয় পক্ষের (ক্রেতা এবং বিক্রেতা) স্ক্রিনশট, ব্র্যান্ড ডেটা এবং সার্ভার লগ ক্রস-চেক করে ম্যানুয়ালি যাচাই করব কে সত্য বলছে।</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">২. প্রতারণার শাস্তি এবং আইনি ব্যবস্থা</h2>
        <p>প্রমাণ যাচাইয়ের পর যদি প্রমাণিত হয় যে কোনো মার্চেন্ট বা ক্লায়েন্ট কাস্টমারের কাছ থেকে অগ্রিম টাকা নিয়ে ফিজিক্যাল বা ডিজিটাল প্রোডাক্ট বুঝিয়ে দেননি, তবে নিম্নলিখিত পদক্ষেপ গ্রহণ করা হবে:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>ওয়ার্নিং ও সমাধান:</strong> রিপোর্ট পাওয়ার পর তা প্রমাণাদিসহ আপনাকে জানানো হবে। আপনি যদি কাস্টমারের সমস্যার সমাধান করতে ব্যর্থ হন বা অস্বীকৃতি জানান, তবে আপনার অ্যাকাউন্ট ব্যান করা হবে।</li>
          <li><strong>স্থায়ী নিষেধাজ্ঞা (Permanent Ban):</strong> অভিযোগ প্রমাণিত হলে ক্লায়েন্টের অ্যাকাউন্ট তাৎক্ষণিকভাবে পার্মানেন্ট ব্যান করা হবে এবং ওই ব্যক্তির NID/জন্ম নিবন্ধন আমাদের সার্ভারে কালোতালিকাভুক্ত (Blacklisted) হবে।</li>
          <li><strong>রিফান্ড বাধ্যবাধকতা:</strong> ক্লায়েন্টকে অবশ্যই কাস্টমারের সম্পূর্ণ টাকা নিজ দায়িত্বে ফেরত দিতে হবে।</li>
          <li><strong>মামলা ও আইনি পদক্ষেপ:</strong> কাস্টমারের থেকে টাকা নিয়ে তা যদি ক্লায়েন্ট ফেরত না দেন বা সমাধান গঠনমূলক না করেন, তবে ক্লায়েন্টের দেওয়া আইডেন্টিটি (NID/Birth Certificate) ব্যবহার করে দেশের প্রচলিত <strong>ভোক্তা অধিকার সংরক্ষণ আইন</strong> এবং <strong>ডিজিটাল নিরাপত্তা/সাইবার আইন</strong> অনুযায়ী আমরা সরাসরি আইনি ব্যবস্থা ও মামলা দায়ের করব। প্রমাণ যাচাই করে ক্লায়েন্টকে জানিয়ে, ফোন বা ইমেইলে যোগাযোগ করেই ব্যান করা হবে।</li>
        </ul>
      </section>
    </div>
  </LegalLayout>
);

export const DeveloperDocsPage = () => (
  <LegalLayout title="API Documentation" icon={FileText} lastUpdated="August 2026">
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
      <p className="text-lg text-white leading-relaxed">
        লগইন করে আপনার প্রোফাইল ডিটেইলস সেভ করার পর, আপনি <strong>Your MecoPay</strong> সেকশন থেকে <strong>Documentation Docs</strong>-এ custom (Laravel, Node.js, Python) ইত্যাদি দিয়ে তৈরি ওয়েবসাইটের জন্য বিস্তারিত API Documentation ও JSON পে-লোড দেখতে পারবেন।
      </p>
      <p className="text-neutral-400 leading-relaxed">
        এছাড়া, WordPress/WooCommerce ওয়েবসাইট ইন্টিগ্রেশনের জন্য Plugin আপনি <strong>'Apps & Plugin'</strong> সেকশনে পাবেন এবং Personal MFS অটোমেশনের জন্য প্রয়োজনীয় <strong>'Sync App'</strong> ও ওখান থেকেই ডাউনলোড করতে পারবেন। আমাদের সাথে থাকার জন্য ধন্যবাদ!
      </p>
    </div>
  </LegalLayout>
);
