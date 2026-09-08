const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const oldChunks = `const textChunks = [
  [
    "MecoPay একটি পূর্ণাঙ্গ ই-কমার্স সলিউশন—",
    "একই সাথে শক্তিশালী পেমেন্ট গেটওয়ে",
    "এবং নো-কোড ওয়েবসাইট বিল্ডার।"
  ],
  [
    "Custom Website বা No-Code ওয়েবসাইটে",
    "Payment Link-এ পেমেন্ট রিসিভ করুন,",
    "সোশ্যাল মিডিয়ায় শেয়ার করে পেমেন্ট নিন।"
  ],
  [
    "কয়েক ক্লিকেই ওয়েবসাইট তৈরি করুন,",
    "কাস্টম ডোমেইন অ্যাড করে নিজের",
    "ডিজিটাল আইডেন্টিটি তৈরি করুন।"
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

code = code.replace(oldChunks, newChunks);

// Optional: tweak the text size a tiny bit for small screens so the longer text fits
const oldContainer = `className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-[16px] xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-relaxed md:leading-tight mb-12 max-w-7xl mx-auto w-full px-2 relative overflow-hidden"`;
const newContainer = `className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-[14px] xs:text-base sm:text-xl md:text-3xl lg:text-4xl font-extrabold leading-relaxed md:leading-tight mb-12 max-w-7xl mx-auto w-full px-2 relative overflow-hidden"`;
code = code.replace(oldContainer, newContainer);

fs.writeFileSync('src/components/Login.tsx', code);
