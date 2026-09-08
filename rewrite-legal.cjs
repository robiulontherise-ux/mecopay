const fs = require('fs');

const code = `import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, RefreshCcw } from 'lucide-react';
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
  <LegalLayout title="প্রাইভেসি পলিসি" icon={ShieldCheck} lastUpdated="৩ আগস্ট ২০২৬">
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">১.১. আমরা কী কী তথ্য সংগ্রহ করি</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>পরিচয়পত্র ও প্রমাণ:</strong> আপনার জাতীয় পরিচয়পত্র (NID) নম্বর, NID-এর ছবি, জন্ম নিবন্ধন (Birth Certificate) নম্বর এবং জন্ম নিবন্ধনের ছবি। (যাদের বয়স ১৮ বছরের নিচে তাদের ক্ষেত্রে জন্ম নিবন্ধন বাধ্যতামূলক, এবং ১৮ বছরের উপরে হলে NID বাধ্যতামূলক)।</li>
          <li><strong>যোগাযোগের তথ্য:</strong> ফোন নম্বর, নাম এবং ইমেইল অ্যাড্রেস।</li>
          <li><strong>ট্রানজেকশন ডেটা:</strong> পেমেন্ট লিংক, ইনভয়েস এবং ট্রানজেকশন স্ট্যাটাস।</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">১.২. পাসওয়ার্ডলেস লগইন এবং ডিভাইস সিকিউরিটি</h2>
        <p>MecoPay-তে কোনো সনাতন ইমেইল এবং পাসওয়ার্ড সিস্টেম নেই। পাসওয়ার্ড চুরি হওয়ার কোনো ঝুঁকি আমাদের প্ল্যাটফর্মে নেই।</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>গুগল লগইন:</strong> অ্যাকাউন্টে প্রবেশ করতে হলে শুধুমাত্র নির্দিষ্ট ডিভাইসে সিঙ্ক করা ভেরিফায়েড গুগল অ্যাকাউন্ট (Google Account) দিয়ে লগইন করতে হবে।</li>
          <li><strong>অ্যাক্সেস সুরক্ষা:</strong> কেউ আপনার ইমেইল জেনে ফেললেও, ভেরিফায়েড ডিভাইস এবং গুগল অ্যাকাউন্টের অ্যাক্সেস ছাড়া সে কোনোভাবেই আপনার MecoPay অ্যাকাউন্টে প্রবেশ করতে পারবে না।</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">১.৩. সিঙ্গেল অ্যাকাউন্ট এবং পার্মানেন্ট লক পলিসি</h2>
        <p>আমাদের প্ল্যাটফর্মে একজন ব্যক্তির তথ্য দিয়ে কেবল একটি অ্যাকাউন্টই খোলা সম্ভব। লগইন প্রোফাইলে আইডেন্টিটি ভেরিফিকেশনের জন্য দুটি অপশন থাকে (১৮ বছরের নিচে বা ১৮ বছরের উপরে):</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>১৮ বছরের উপরে:</strong> NID এবং জন্ম নিবন্ধন (Birth Certificate) উভয়ের তথ্য প্রদান বাধ্যতামূলক। একবার প্রোফাইল ভেরিফাই করা হলে, এই ডকুমেন্টগুলো সিস্টেমে পার্মানেন্টলি লক (Permanent Lock) হয়ে যাবে। এরপর প্রোফাইল আপগ্রেড বা পরিবর্তন করার কোনো সুযোগ থাকবে না।</li>
          <li><strong>১৮ বছরের নিচে:</strong> শুধুমাত্র জন্ম নিবন্ধনের তথ্য ও ছবি প্রদান করে অ্যাকাউন্ট ভেরিফাই করা যাবে। এই ক্ষেত্রে পরবর্তীতে NID আপডেট করার সুযোগ থাকবে, তবে জন্ম নিবন্ধন তথ্যটি পার্মানেন্টলি লক থাকবে।</li>
          <li><strong>সতর্কতা:</strong> আপনার বয়স যদি ১৮ বছরের উপরে হয়, কিন্তু আপনি NID প্রদান এড়ানোর জন্য শুধুমাত্র জন্ম নিবন্ধন সিলেক্ট করেন, তবে আপনার অ্যাকাউন্ট ভেরিফাই হবে না এবং আমরা অ্যাকাউন্টটি ব্লক করে দেব। একই ডকুমেন্ট দিয়ে দ্বিতীয় কোনো অ্যাকাউন্ট খোলার চেষ্টা করলে তা স্বয়ংক্রিয়ভাবে বাতিল বলে গণ্য হবে।</li>
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
  <LegalLayout title="শর্তাবলী (Terms & Conditions)" icon={FileText} lastUpdated="৩ আগস্ট ২০২৬">
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">২.১. সার্ভিসের বিবরণ</h2>
        <p>MecoPay একটি অত্যাধুনিক পেমেন্ট অটোমেশন সফটওয়্যার এবং ই-কমার্স স্যাস (SaaS) প্ল্যাটফর্ম। এটি কোনো ব্যাংক বা আর্থিক প্রতিষ্ঠান নয়, বরং মার্চেন্ট এবং কাস্টমারদের মধ্যে লেনদেন স্বয়ংক্রিয় করার একটি প্রযুক্তিগত মাধ্যম।</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">২.২. অটো-রাউটিং এবং ট্রানজেকশন লিমিট</h2>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>পার্সোনাল MFS:</strong> ইউজাররা তাদের পার্সোনাল মোবাইল ব্যাংকিং অ্যাকাউন্ট ব্যবহার করতে পারবেন। সিস্টেমে সর্বোচ্চ ২টি পার্সোনাল নাম্বার সেট করা যাবে। প্রথম নাম্বারের দৈনিক বা মাসিক লিমিট শেষ হলে সিস্টেম স্বয়ংক্রিয়ভাবে দ্বিতীয় নাম্বারে পেমেন্ট রাউট করবে।</li>
          <li><strong>মার্চেন্ট API:</strong> পার্সোনাল অ্যাকাউন্টের লিমিটের চেয়ে বেশি ভলিউমের ট্রানজেকশন প্রয়োজন হলে ইউজারকে অবশ্যই মার্চেন্ট API সেট করতে হবে।</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">২.৩. দায়বদ্ধতার সীমাবদ্ধতা (Limitation of Liability)</h2>
        <p>ইউজারের পার্সোনাল MFS অ্যাকাউন্টে অতিরিক্ত ট্রানজেকশন বা অটো-রাউটিং ব্যবহারের কারণে সংশ্লিষ্ট মোবাইল ব্যাংকিং কর্তৃপক্ষ (যেমন: বিকাশ, নগদ, রকেট) যদি ইউজারের অ্যাকাউন্ট সাময়িক বা স্থায়ীভাবে লিমিট, ব্লক বা সাসপেন্ড করে, তবে এর সম্পূর্ণ দায়ভার ইউজারের। MecoPay এর জন্য কোনোভাবেই আইনি বা আর্থিকভাবে দায়ী থাকবে না।</p>
      </section>
    </div>
  </LegalLayout>
);

export const RefundPolicy = () => (
  <LegalLayout title="কাস্টমার রাইটস এবং অ্যান্টি-ফ্রড পলিসি" icon={RefreshCcw} lastUpdated="৩ আগস্ট ২০২৬">
    <div className="space-y-8">
      <section>
        <p>আমরা কাস্টমারদের অধিকার রক্ষায় জিরো-টলারেন্স নীতি মেনে চলি। MecoPay-এর পেমেন্ট চেকআউট পেজে একটি সরাসরি <strong>'রিপোর্ট' (Report)</strong> বাটন রয়েছে। কাস্টমার প্রতারিত হলে এই বাটনের মাধ্যমে সরাসরি আমাদের কাছে অভিযোগ জানাতে পারবেন।</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">৩.১. ডেলিভারি যাচাইকরণ প্রক্রিয়া</h2>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>ফিজিক্যাল প্রোডাক্ট (Physical Products):</strong> ক্লায়েন্ট কাস্টম ওয়েবসাইট বা আমাদের উকমার্স (WooCommerce) সিস্টেম ব্যবহার করুক না কেন, ফিজিক্যাল প্রোডাক্টের ক্ষেত্রে ডেলিভারি API (কুরিয়ার এপিআই) কানেক্ট করা বাধ্যতামূলক। আমাদের মাদার ব্যাকএন্ড সরাসরি কুরিয়ার এপিআই থেকে ডেটা রিড করে রিয়েল-টাইমে যাচাই করবে যে প্রোডাক্ট কাস্টমারের কাছে সফলভাবে ডেলিভারি হয়েছে কিনা।</li>
          <li><strong>ডিজিটাল প্রোডাক্ট (Digital Products):</strong> ডিজিটাল প্রোডাক্ট বা সার্ভিসের ক্ষেত্রে অভিযোগ আসলে, আমরা উভয় পক্ষের (ক্রেতা এবং বিক্রেতা) স্ক্রিনশট, ব্র্যান্ড ডেটা এবং সার্ভার লগ ক্রস-চেক করে ম্যানুয়ালি যাচাই করব কে সত্য বলছে।</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">৩.২. প্রতারণার শাস্তি এবং আইনি ব্যবস্থা</h2>
        <p>প্রমাণ যাচাইয়ের পর যদি প্রমাণিত হয় যে কোনো মার্চেন্ট বা ক্লায়েন্ট কাস্টমারের কাছ থেকে অগ্রিম টাকা নিয়ে ফিজিক্যাল বা ডিজিটাল প্রোডাক্ট বুঝিয়ে দেননি, তবে নিম্নলিখিত পদক্ষেপ গ্রহণ করা হবে:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>স্থায়ী নিষেধাজ্ঞা (Permanent Ban):</strong> অভিযোগ আসার পর ক্লায়েন্টকে জানানো হবে। ক্লায়েন্ট যদি সমস্যার সমাধান করতে ব্যর্থ হন, তবে অ্যাকাউন্টে তাৎক্ষণিকভাবে পার্মানেন্ট ব্যান করা হবে এবং ওই ব্যক্তির NID/জন্ম নিবন্ধন আমাদের সার্ভারে কালোতালিকাভুক্ত (Blacklisted) হবে।</li>
          <li><strong>রিফান্ড বাধ্যবাধকতা:</strong> ক্লায়েন্টকে অবশ্যই কাস্টমারের সম্পূর্ণ টাকা নিজ দায়িত্বে ফেরত দিতে হবে।</li>
          <li><strong>মামলা ও আইনি পদক্ষেপ:</strong> ক্লায়েন্ট যদি কাস্টমারের টাকা ফেরত দিতে বা সমস্যার সমাধান করতে অস্বীকৃতি জানায়, তবে MecoPay কর্তৃপক্ষ ক্লায়েন্টের প্রদত্ত NID, জন্ম নিবন্ধন এবং অন্যান্য ডিজিটাল প্রমাণের ভিত্তিতে দেশের প্রচলিত <strong>ভোক্তা অধিকার সংরক্ষণ আইন</strong> এবং <strong>ডিজিটাল নিরাপত্তা/সাইবার আইন</strong> অনুযায়ী আইনশৃঙ্খলারক্ষাকারী বাহিনীর কাছে সরাসরি মামলা দায়ের করবে।</li>
        </ul>
      </section>
    </div>
  </LegalLayout>
);
`;

fs.writeFileSync('src/components/Legal.tsx', code);
