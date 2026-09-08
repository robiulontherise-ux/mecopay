const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const newChunks = `const textChunks = [
  [
    "MecoPay একটি পূর্ণাঙ্গ ই-কমার্স সলিউশন—",
    "যা একই সাথে শক্তিশালী পেমেন্ট গেটওয়ে",
    "এবং নো-কোড ওয়েবসাইট বিল্ডার।"
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
  ]
];`;

code = code.replace(/const textChunks = \[[\s\S]*?\];\n/, newChunks + '\n');

// Navbar update: keep only "Sign in with Google" with blue bg and remove the center "Sign In" button.
const navRegex = /<nav className="fixed top-0 inset-x-0 z-50 flex flex-col items-center px-4 py-3 bg-neutral-950\/80 backdrop-blur-md border-b border-neutral-800">[\s\S]*?<\/nav>/;

const newNav = `<nav className="fixed top-0 inset-x-0 z-50 flex flex-col items-center px-4 py-3 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="w-full max-w-7xl flex items-center justify-between relative">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="https://i.postimg.cc/gX1nxKHH/logo.png" alt="MecoPay" className="h-8 sm:h-9 w-auto rounded-xl shadow-sm" onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/Zn53D792/Meco-Pay-Logo.png"; }} />
            <span className="text-[18px] sm:text-xl font-bold text-white tracking-tight">MecoPay</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all shadow-sm"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6 sm:gap-10 mt-3 text-[15px] sm:text-[17px] font-bold text-neutral-300">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#developers" className="hover:text-white transition-colors">Developers</a>
        </div>
      </nav>`;
code = code.replace(navRegex, newNav);

// Update marquee text
const oldMarqueeSpan = '<span className="text-lg md:text-2xl font-bold text-neutral-300">ডিজিটাল প্রোডাক্ট ও কোর্স পেমেন্ট অটোমেশন <span className="mx-8 text-pink-500/50">•</span> ফিজিক্যাল প্রোডাক্ট অ্যাডভান্স পেমেন্ট সিস্টেম (ফ্রড অর্ডার কমাতে) <span className="mx-8 text-pink-500/50">•</span></span>';
const newMarqueeSpan = '<span className="text-lg md:text-2xl font-bold text-neutral-300">১. পার্সোনাল MFS: যাদের ট্রেড লাইসেন্স বা TIN নেই তাদের জন্য <span className="mx-8 text-pink-500/50">•</span> ২. মার্চেন্ট MFS/Bank/Card: ট্রেড লাইসেন্সধারীদের জন্য আনলিমিটেড স্কেলিং <span className="mx-8 text-pink-500/50">•</span> ৩. বাংলা QR: ফিজিক্যাল দোকানের হিসাব ও অনলাইন সেল <span className="mx-8 text-pink-500/50">•</span></span>';
code = code.split(oldMarqueeSpan).join(newMarqueeSpan);

fs.writeFileSync('src/components/Login.tsx', code);
