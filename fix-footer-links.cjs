const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const oldFooter = `      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-10 text-center mt-12">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-sm font-semibold">
          <a href="/privacy-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">প্রাইভেসি পলিসি</a>
          <a href="/terms-conditions" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">শর্তাবলী</a>
          <a href="/refund-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">কাস্টমার রাইটস ও অ্যান্টি-ফ্রড</a>
        </div>`;

const newFooter = `      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-10 text-center mt-12">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-sm font-semibold">
          <a href="/privacy-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Privacy Policy</a>
          <a href="/terms-conditions" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Terms & Conditions</a>
          <a href="/refund-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Refund Policy</a>
        </div>`;

code = code.replace(oldFooter, newFooter);

// Fix the text chunks so they don't wrap and cause the white overflow issue
const oldChunks = `const textChunks = [
  [
    "MecoPay একটি পূর্ণাঙ্গ ই-কমার্স সলিউশন—",
    "যা একই সাথে শক্তিশালী পেমেন্ট গেটওয়ে",
    "এবং নো-কোড ওয়েবসাইট বিল্ডার।"
  ],
  [
    "নিজস্ব Custom Website বা আমাদের No-Code ওয়েবসাইটে",
    "API ও Payment Link ব্যবহার করে পেমেন্ট রিসিভ করুন,",
    "সাথে সোশ্যাল মিডিয়ায় শেয়ার করে পেমেন্ট নিন।"
  ],
  [
    "কয়েক ক্লিকেই ওয়েবসাইট তৈরি করুন,",
    "ও কাস্টম ডোমেইন অ্যাড করে নিজের",
    "প্ল্যাটফর্মের ডিজিটাল আইডেন্টিটি তৈরি করুন।"
  ],
  [
    "n8n AI এজেন্টের মাধ্যমে সোশ্যাল মিডিয়া থেকে",
    "অটোমেটিক অর্ডার ও পেমেন্ট রিসিভ করুন",
    "(আমাদের প্ল্যাটফর্ম থেকে নো-কোড ওয়েবসাইট",
    "আর কাস্টম ডোমেইন অ্যাডকারীদের জন্য)"
  ],
  [
    "আমাদের প্ল্যাটফর্মে কুরিয়ার API অ্যাড করে",
    "১ ক্লিকেই অর্ডার কনফার্মেশন",
    "সরাসরি কুরিয়ারে পাঠান।"
  ]
];`;

const newChunks = `const textChunks = [
  [
    "MecoPay একটি পূর্ণাঙ্গ ই-কমার্স সলিউশন—",
    "যা একই সাথে শক্তিশালী পেমেন্ট গেটওয়ে",
    "এবং নো-কোড ওয়েবসাইট বিল্ডার।"
  ],
  [
    "নিজস্ব Custom Website বা",
    "আমাদের No-Code ওয়েবসাইটে",
    "API ও Payment Link ব্যবহার করে",
    "সোশ্যাল মিডিয়ায় পেমেন্ট নিন।"
  ],
  [
    "কয়েক ক্লিকেই ওয়েবসাইট তৈরি করুন,",
    "ও কাস্টম ডোমেইন অ্যাড করে",
    "ডিজিটাল আইডেন্টিটি তৈরি করুন।"
  ],
  [
    "n8n AI এজেন্টের মাধ্যমে",
    "অটোমেটিক অর্ডার ও পেমেন্ট রিসিভ করুন",
    "(নো-কোড ওয়েবসাইট ইউজারদের জন্য)"
  ],
  [
    "আমাদের প্ল্যাটফর্মে কুরিয়ার API অ্যাড করে",
    "১ ক্লিকেই অর্ডার কনফার্মেশন",
    "সরাসরি কুরিয়ারে পাঠান।"
  ]
];`;
code = code.replace(oldChunks, newChunks);

// Change back to whitespace-nowrap to prevent the wrapping artifact
const oldLineClass = `className="relative inline-block py-1 px-1 overflow-hidden" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}`;
const newLineClass = `className="relative inline-block overflow-hidden py-1 px-1 whitespace-nowrap"`;
code = code.replace(oldLineClass, newLineClass);

// Tweak text size to ensure it fits on mobile
const oldContainer = `className="h-auto min-h-[14rem] sm:min-h-[16rem] md:min-h-[20rem] flex flex-col items-center justify-center text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-loose md:leading-relaxed mb-12 max-w-7xl mx-auto w-full px-2 sm:px-4 relative"`;
const newContainer = `className="h-auto min-h-[14rem] sm:min-h-[16rem] md:min-h-[20rem] flex flex-col items-center justify-center text-[17px] xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-loose md:leading-relaxed mb-12 max-w-7xl mx-auto w-full px-1 sm:px-4 relative"`;
code = code.replace(oldContainer, newContainer);

fs.writeFileSync('src/components/Login.tsx', code);
