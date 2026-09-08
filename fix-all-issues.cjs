const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// 1. Update text chunks to address specific requests:
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
    "(নো-কোড ওয়েবসাইট ও কাস্টম ডোমেইন ইউজারদের জন্য)"
  ]
];`;
code = code.replace(/const textChunks = \[[\s\S]*?\];\n/, newChunks + '\n');

// 2. Fix the Hero animation highlight (make it apply to all lines instead of just lineIndex === 1)
// It seems earlier I removed the motion.div for the background highlight, let's restore it but for all lines.
// First, let's check what the block looks like right now by using string replacement carefully.
// Wait, in previous step I did: `code = code.replace(/\{lineIndex === 1 && \([\s\S]*?<\/motion\.div>\s*\)\}/, '');`
// So the highlight div is GONE. I need to re-add it.
code = code.replace(
  /className="inline-block relative z-10 text-white drop-shadow-md px-2"\s*>\s*\{line\}\s*<\/motion\.span>/g,
  `className="inline-block relative z-10 text-white drop-shadow-md px-2"
                  >
                    {line}
                  </motion.span>
                  <motion.div 
                    initial={{ left: 0, width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.6, delay: lineIndex * 0.4, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 left-0 bg-[#c084fc]/60 z-0 rounded-lg shadow-sm"
                  />`
);


// 3. Fix Features section title
code = code.replace(
  /<h2 className="text-3xl md:text-4xl font-bold text-white mb-20 tracking-tight text-center">\s*পেমেন্ট এবং অ্যানালিটিক্স ইকোসিস্টেম\s*<\/h2>/,
  `<h2 className="text-3xl md:text-4xl font-bold text-white mb-20 tracking-tight text-center">
          Our Service Category
        </h2>`
);

// 4. Update the Marquee text and English spellings.
const oldMarqueeSpan = /<span className="text-lg md:text-2xl font-bold text-neutral-300">১\. পার্সোনাল MFS: যাদের ট্রেড লাইসেন্স বা TIN নেই তাদের জন্য। ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল, ফ্রড অর্ডার কমাতে অ্যাডভান্স পেমেন্ট রিসিভ করুন। <span className="mx-8 text-pink-500\/50">•<\/span> ২\. মার্চেন্ট MFS\/Bank\/Card: ট্রেড লাইসেন্সধারীদের জন্য। আনলিমিটেড পেমেন্ট রিসিভ, ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল এবং অ্যাডভান্স পেমেন্ট সিস্টেম। <span className="mx-8 text-pink-500\/50">•<\/span> ৩\. বাংলা QR: ফিজিক্যাল শপ বা শোরুমে বাংলা QR দিয়ে পেমেন্ট নিন ও ডিজিটাল হিসাব রাখুন। ফিজিক্যাল শপের পাশাপাশি অনলাইনেও সেল ও আইডেন্টিটি তৈরি করুন। <span className="mx-8 text-pink-500\/50">•<\/span><\/span>/g;
const newMarqueeSpan = '<span className="text-lg md:text-2xl font-bold text-neutral-300">১. পার্সোনাল MFS: যাদের Trade License বা TIN Certificate নেই তাদের জন্য। ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল, ফ্রড অর্ডার কমাতে অ্যাডভান্স পেমেন্ট রিসিভ করুন। <span className="mx-8 text-pink-500/50">•</span> ২. মার্চেন্ট MFS/Bank/Card: Trade License ধারীদের জন্য। আনলিমিটেড পেমেন্ট রিসিভ, ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল এবং অ্যাডভান্স পেমেন্ট সিস্টেম। <span className="mx-8 text-pink-500/50">•</span> ৩. বাংলা QR: ফিজিক্যাল শপ বা শোরুমে বাংলা QR দিয়ে পেমেন্ট নিন ও ডিজিটাল হিসাব রাখুন। ফিজিক্যাল শপের পাশাপাশি অনলাইনেও সেল ও আইডেন্টিটি তৈরি করুন। <span className="mx-8 text-pink-500/50">•</span></span>';

code = code.replace(oldMarqueeSpan, newMarqueeSpan);

// 5. Fix Marquee width (w-max) so it doesn't break
code = code.replace(/className="flex whitespace-nowrap gap-16"/g, 'className="flex w-max whitespace-nowrap gap-16"');

// 6. Update Descriptive feature cards for Trade License / TIN
code = code.replace(/যাদের ট্রেড লাইসেন্স ও টিন \(TIN\) আছে/g, 'যাদের Trade License ও TIN Certificate আছে');
code = code.replace(/ট্রেড লাইসেন্স নেই\?/g, 'Trade License নেই?');
code = code.replace(/যাদের ট্রেড লাইসেন্স বা টিন নেই/g, 'যাদের Trade License বা TIN Certificate নেই');

fs.writeFileSync('src/components/Login.tsx', code);
