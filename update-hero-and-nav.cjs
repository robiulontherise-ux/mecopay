const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// Update text chunks
const oldChunksRegex = /const textChunks = \[[\s\S]*?\];/;
const newChunks = `const textChunks = [
  [
    "MecoPay একটি পূর্ণাঙ্গ ই-কমার্স সলিউশন—",
    "যা একই সাথে শক্তিশালী পেমেন্ট গেটওয়ে",
    "এবং নো-কোড ওয়েবসাইট বিল্ডার।"
  ],
  [
    "n8n AI এজেন্টের মাধ্যমে সোশ্যাল মিডিয়া থেকে",
    "অটোমেটিক অর্ডার ও পেমেন্ট রিসিভ করুন",
    "(নো-কোড ওয়েবসাইট ও কাস্টম ডোমেইন ইউজারদের জন্য)"
  ],
  [
    "মার্চেন্ট API ব্যবহার করে আনলিমিটেড",
    "এবং পার্সোনাল মোবাইল ব্যাংকিং দিয়ে",
    "লিমিট অনুযায়ী পেমেন্ট রিসিভ করুন।"
  ],
  [
    "নিজস্ব ওয়েবসাইটে API Key ব্যবহার করে",
    "পার্সোনাল বা মার্চেন্ট পেমেন্ট রিসিভ করুন,",
    "সাথে রয়েছে নিজস্ব SMS গেটওয়ে অ্যাপ।"
  ],
  [
    "কয়েক ক্লিকেই ওয়েবসাইট তৈরি করুন,",
    "ও কাস্টম ডোমেইন অ্যাড করে নিজের",
    "প্ল্যাটফর্মের ডিজিটাল আইডেন্টিটি তৈরি করুন।"
  ]
];`;

code = code.replace(oldChunksRegex, newChunks);

// Update Navbar to include Home
code = code.replace(
  '<a href="#features" className="hover:text-white transition-colors">Features</a>',
  '<a href="#home" className="hover:text-white transition-colors">Home</a>\n          <a href="#features" className="hover:text-white transition-colors">Features</a>'
);

// Add id="home" to Hero Section
code = code.replace(
  '{/* Hero Section */}\n      <section className="relative z-10 pt-40 pb-20 px-6 text-center max-w-6xl mx-auto flex flex-col items-center">',
  '{/* Hero Section */}\n      <section id="home" className="relative z-10 pt-40 pb-20 px-6 text-center max-w-6xl mx-auto flex flex-col items-center">'
);

fs.writeFileSync('src/components/Login.tsx', code);
