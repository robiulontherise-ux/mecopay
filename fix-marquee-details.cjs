const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const oldMarqueeSpan = '<span className="text-lg md:text-2xl font-bold text-neutral-300">১. পার্সোনাল MFS: যাদের ট্রেড লাইসেন্স বা TIN নেই তাদের জন্য <span className="mx-8 text-pink-500/50">•</span> ২. মার্চেন্ট MFS/Bank/Card: ট্রেড লাইসেন্সধারীদের জন্য আনলিমিটেড স্কেলিং <span className="mx-8 text-pink-500/50">•</span> ৩. বাংলা QR: ফিজিক্যাল দোকানের হিসাব ও অনলাইন সেল <span className="mx-8 text-pink-500/50">•</span></span>';

const newMarqueeSpan = '<span className="text-lg md:text-2xl font-bold text-neutral-300">১. পার্সোনাল MFS: যাদের ট্রেড লাইসেন্স বা TIN নেই তাদের জন্য। ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল, ফ্রড অর্ডার কমাতে অ্যাডভান্স পেমেন্ট রিসিভ করুন। <span className="mx-8 text-pink-500/50">•</span> ২. মার্চেন্ট MFS/Bank/Card: ট্রেড লাইসেন্সধারীদের জন্য। আনলিমিটেড পেমেন্ট রিসিভ, ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল এবং অ্যাডভান্স পেমেন্ট সিস্টেম। <span className="mx-8 text-pink-500/50">•</span> ৩. বাংলা QR: ফিজিক্যাল শপ বা শোরুমে বাংলা QR দিয়ে পেমেন্ট নিন ও ডিজিটাল হিসাব রাখুন। ফিজিক্যাল শপের পাশাপাশি অনলাইনেও সেল ও আইডেন্টিটি তৈরি করুন। <span className="mx-8 text-pink-500/50">•</span></span>';

code = code.split(oldMarqueeSpan).join(newMarqueeSpan);

// In case the transition duration needs to be longer for this much text
code = code.replace(/transition={{ ease: "linear", duration: 15, repeat: Infinity }}/g, 'transition={{ ease: "linear", duration: 35, repeat: Infinity }}');

fs.writeFileSync('src/components/Login.tsx', code);
