const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// Update text chunks
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
    "(আমাদের প্ল্যাটফর্ম থেকে নো-কোড ওয়েবসাইট আর কাস্টম ডোমেইন অ্যাডকারীদের জন্য)"
  ],
  [
    "আমাদের প্ল্যাটফর্মে কুরিয়ার API অ্যাড করে",
    "১ ক্লিকেই অর্ডার কনফার্মেশন",
    "সরাসরি কুরিয়ারে পাঠান।"
  ]
];`;
code = code.replace(oldChunks, newChunks);

// Update diagram colors and arrows
const oldDiagram = `{/* Tree Diagram */}
        <div className="relative flex flex-col items-center mb-16 w-full max-w-4xl">
          {/* Top Node */}
          <div className="w-5 h-5 rounded-full bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.8)] z-10 relative"></div>
          
          {/* Branch Lines Container */}
          <div className="relative w-full h-20 sm:h-32 -mt-2">
            {/* SVG lines for branches */}
            <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 50 0 L 16.66 100" stroke="#ec4899" strokeWidth="1.5" fill="none" className="opacity-80" />
              <path d="M 50 0 L 50 100" stroke="#ec4899" strokeWidth="1.5" fill="none" className="opacity-80" />
              <path d="M 50 0 L 83.33 100" stroke="#ec4899" strokeWidth="1.5" fill="none" className="opacity-80" />
            </svg>
          </div>

          {/* Leaf Nodes */}
          <div className="flex w-full justify-between items-start pt-2">
            <div className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl text-center w-1/3 px-1 drop-shadow-[0_2px_10px_rgba(236,72,153,0.5)]">
              Personal <br/> mfs
            </div>
            <div className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl text-center w-1/3 px-1 drop-shadow-[0_2px_10px_rgba(236,72,153,0.5)]">
              Merchant mfs <br/> /Bank/Card
            </div>
            <div className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl text-center w-1/3 px-1 drop-shadow-[0_2px_10px_rgba(236,72,153,0.5)]">
              Bangla QR
            </div>
          </div>
        </div>`;

const newDiagram = `{/* Tree Diagram */}
        <div className="relative flex flex-col items-center mb-16 w-full max-w-4xl">
          {/* Top Node */}
          <div className="w-5 h-5 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] z-10 relative"></div>
          
          {/* Branch Lines Container */}
          <div className="relative w-full h-20 sm:h-32 -mt-2">
            {/* SVG lines for branches */}
            <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                  <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
                </marker>
              </defs>
              <path d="M 50 0 L 16.66 96" stroke="#3b82f6" strokeWidth="1.5" fill="none" className="opacity-80" markerEnd="url(#arrowhead)" />
              <path d="M 50 0 L 50 96" stroke="#3b82f6" strokeWidth="1.5" fill="none" className="opacity-80" markerEnd="url(#arrowhead)" />
              <path d="M 50 0 L 83.33 96" stroke="#3b82f6" strokeWidth="1.5" fill="none" className="opacity-80" markerEnd="url(#arrowhead)" />
            </svg>
          </div>

          {/* Leaf Nodes */}
          <div className="flex w-full justify-between items-start pt-2">
            <div className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl text-center w-1/3 px-1 drop-shadow-[0_2px_10px_rgba(59,130,246,0.5)]">
              Personal <br/> mfs
            </div>
            <div className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl text-center w-1/3 px-1 drop-shadow-[0_2px_10px_rgba(59,130,246,0.5)]">
              Merchant mfs <br/> /Bank/Card
            </div>
            <div className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl text-center w-1/3 px-1 drop-shadow-[0_2px_10px_rgba(59,130,246,0.5)]">
              Bangla QR
            </div>
          </div>
        </div>`;

code = code.replace(oldDiagram, newDiagram);

fs.writeFileSync('src/components/Login.tsx', code);
