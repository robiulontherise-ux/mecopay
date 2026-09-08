const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// 1. Fix the text chunks to be shorter so they don't wrap awkwardly on mobile.
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
    "(আমাদের প্ল্যাটফর্ম থেকে নো-কোড ওয়েবসাইট আর কাস্টম ডোমেইন অ্যাডকারীদের জন্য)"
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
code = code.replace(oldChunks, newChunks);

// 2. Change setInterval to setTimeout to make interval dynamic based on the number of lines
const oldEffect = `  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChunk((prev) => (prev + 1) % textChunks.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);`;

const newEffect = `  useEffect(() => {
    // Calculate total time needed for the current chunk to finish its animation
    // Duration is 2.0s, delay is 0.5 + lineIndex * 2.0
    // We add 1.0s extra reading time after the last line finishes
    const numLines = textChunks[currentChunk].length;
    const animationTimeMs = (0.5 + (numLines - 1) * 2.0 + 2.0 + 1.0) * 1000;
    
    const timeout = setTimeout(() => {
      setCurrentChunk((prev) => (prev + 1) % textChunks.length);
    }, animationTimeMs);
    
    return () => clearTimeout(timeout);
  }, [currentChunk]);`;
code = code.replace(oldEffect, newEffect);

// 3. Prevent text wrap on the inline-block container so it perfectly fits the background
// We add "whitespace-nowrap" to the div wrapping the motion.span
const oldDivClass = `className="relative inline-block overflow-hidden py-1"`;
const newDivClass = `className="relative inline-block overflow-hidden py-1 whitespace-nowrap"`;
code = code.replace(oldDivClass, newDivClass);

// We also need to add a scale transform for very small screens so the whitespace-nowrap doesn't overflow the screen
const oldTextContainer = `className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-relaxed md:leading-tight mb-12 max-w-7xl mx-auto w-full px-2 relative"`;
const newTextContainer = `className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-[16px] xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-relaxed md:leading-tight mb-12 max-w-7xl mx-auto w-full px-2 relative overflow-hidden"`;
code = code.replace(oldTextContainer, newTextContainer);

fs.writeFileSync('src/components/Login.tsx', code);
