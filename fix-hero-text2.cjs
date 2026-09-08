const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

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
    "n8n AI এজেন্টের মাধ্যমে সোশ্যাল মিডিয়া থেকে",
    "অটোমেটিক অর্ডার ও পেমেন্ট রিসিভ করুন",
    "(নো-কোড ওয়েবসাইট ও কাস্টম ডোমেইন ইউজারদের জন্য)"
  ],
  [
    "আমাদের প্ল্যাটফর্মে কুরিয়ার API অ্যাড করে",
    "১ ক্লিকেই অর্ডার কনফার্মেশন",
    "সরাসরি কুরিয়ারে পাঠান।"
  ]
];`;

const originalChunks = `const textChunks = [
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
code = code.replace(newChunks, originalChunks);

const oldLineClass = `className="relative inline-block overflow-hidden py-1 px-1 whitespace-nowrap"`;
const newLineClass = `className="relative inline-block py-1 px-1 overflow-hidden" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}`;
code = code.replace(oldLineClass, newLineClass);

const oldTextContainer = `className="h-56 sm:h-64 md:h-72 flex flex-col items-center justify-center text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-loose md:leading-normal mb-12 max-w-7xl mx-auto w-full px-2 relative"`;
const newTextContainer = `className="h-auto min-h-[14rem] sm:min-h-[16rem] md:min-h-[20rem] flex flex-col items-center justify-center text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-loose md:leading-relaxed mb-12 max-w-7xl mx-auto w-full px-2 sm:px-4 relative"`;
code = code.replace(oldTextContainer, newTextContainer);

// Change animation a bit so it works nicely with wrapped text
const spanInitial = `initial={{ y: "100%", opacity: 0 }}`;
const spanAnimate = `initial={{ y: 20, opacity: 0 }}`;
code = code.replace(spanInitial, spanAnimate);

fs.writeFileSync('src/components/Login.tsx', code);
