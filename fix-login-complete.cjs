const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// 1. Text chunks update
const chunksStr = `const textChunks = [
  [
    "MecoPay একটি পূর্ণাঙ্গ ই-কমার্স সলিউশন—",
    "যা একই সাথে শক্তিশালী পেমেন্ট গেটওয়ে",
    "এবং নো-কোড ওয়েবসাইট বিল্ডার।"
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

code = code.replace(/const textChunks = \[[\s\S]*?\];\n/, chunksStr + '\n');

// 2. Navbar update
const navRegex = /<nav className="fixed top-0 inset-x-0 z-50 flex flex-col items-center px-4 py-3 bg-neutral-950\/80 backdrop-blur-md border-b border-neutral-800">[\s\S]*?<\/nav>/;

const newNav = `<nav className="fixed top-0 inset-x-0 z-50 flex flex-col items-center px-4 py-3 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="w-full max-w-7xl flex items-center justify-between relative">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="https://i.postimg.cc/gX1nxKHH/logo.png" alt="MecoPay" className="h-8 sm:h-9 w-auto rounded-xl shadow-sm" onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/Zn53D792/Meco-Pay-Logo.png"; }} />
            <span className="text-[18px] sm:text-xl font-bold text-white tracking-tight">MecoPay</span>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 text-neutral-300 hover:text-white px-2 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-all"
            >
              Sign In
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all shadow-sm"
            >
              Sign Up <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6 sm:gap-10 mt-3 text-[15px] sm:text-[17px] font-bold text-neutral-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#developers" className="hover:text-white transition-colors">Developers</a>
        </div>
      </nav>`;

code = code.replace(navRegex, newNav);

// 3. Features Section insertion before Pricing
const featuresSection = `
      {/* Features Section */}
      <section id="features" className="relative z-10 pt-32 pb-16 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-20 tracking-tight text-center">
          Payment & Analytics Ecosystem
        </h2>

        {/* Tree Diagram */}
        <div className="relative flex flex-col items-center mb-16 w-full max-w-4xl">
          {/* Top Node */}
          <div className="w-5 h-5 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] z-10 relative"></div>
          
          {/* Branch Lines Container */}
          <div className="relative w-full h-20 sm:h-32 -mt-2">
            {/* SVG lines for branches */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 50 0 L 16.66 100" stroke="white" strokeWidth="1" fill="none" className="opacity-70" />
              <path d="M 50 0 L 50 100" stroke="white" strokeWidth="1" fill="none" className="opacity-70" />
              <path d="M 50 0 L 83.33 100" stroke="white" strokeWidth="1" fill="none" className="opacity-70" />
            </svg>
          </div>

          {/* Leaf Nodes */}
          <div className="flex w-full justify-between items-start pt-2">
            <div className="text-yellow-400 font-extrabold text-lg sm:text-2xl md:text-3xl text-center w-1/3 px-1 drop-shadow-md">
              Personal <br/> mfs
            </div>
            <div className="text-yellow-400 font-extrabold text-lg sm:text-2xl md:text-3xl text-center w-1/3 px-1 drop-shadow-md">
              Merchant mfs <br/> /Bank/Card
            </div>
            <div className="text-yellow-400 font-extrabold text-lg sm:text-2xl md:text-3xl text-center w-1/3 px-1 drop-shadow-md">
              Bangla QR
            </div>
          </div>
        </div>

        {/* Animated Marquee / Scrolling text for Use Cases */}
        <div className="w-screen overflow-hidden bg-neutral-900/50 py-6 border-y border-neutral-800 mb-20 relative">
           <motion.div 
             animate={{ x: ["0%", "-50%"] }} 
             transition={{ ease: "linear", duration: 25, repeat: Infinity }}
             className="flex whitespace-nowrap gap-16"
           >
             <span className="text-lg md:text-2xl font-bold text-neutral-300">Digital Product & Course Payment Automation <span className="mx-8 text-neutral-600">•</span> Physical Product Advance Payment System for Fraud Order Decrease <span className="mx-8 text-neutral-600">•</span></span>
             <span className="text-lg md:text-2xl font-bold text-neutral-300">Digital Product & Course Payment Automation <span className="mx-8 text-neutral-600">•</span> Physical Product Advance Payment System for Fraud Order Decrease <span className="mx-8 text-neutral-600">•</span></span>
           </motion.div>
        </div>
        
        {/* Descriptive feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
           <div className="bg-neutral-900/80 p-6 md:p-8 rounded-2xl border border-neutral-800 transition-all hover:bg-neutral-800/80">
             <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Unlimited Scaling</h3>
             <p className="text-base text-neutral-400 leading-relaxed">
               For merchants with a Trade License and TIN, enjoy unlimited transactions through Merchant MFS, Bank, and Cards. Scale your business without worrying about volume limits.
             </p>
           </div>
           <div className="bg-neutral-900/80 p-6 md:p-8 rounded-2xl border border-neutral-800 transition-all hover:bg-neutral-800/80">
             <h3 className="text-xl md:text-2xl font-bold text-white mb-4">No Trade License?</h3>
             <p className="text-base text-neutral-400 leading-relaxed">
               Don't have a Trade License or TIN yet? Use Personal MFS as your first gateway. It's perfectly suited for startups and individual creators.
             </p>
           </div>
           <div className="bg-neutral-900/80 p-6 md:p-8 rounded-2xl border border-neutral-800 transition-all hover:bg-neutral-800/80">
             <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Offline & Online</h3>
             <p className="text-base text-neutral-400 leading-relaxed">
               Have a physical shop? Maintain digital records and sell items online seamlessly. Accept payments in-store directly using Bangla QR.
             </p>
           </div>
        </div>
      </section>
`;

code = code.replace('{/* Pricing Section (Clean & Professional) */}', featuresSection + '\n      {/* Pricing Section (Clean & Professional) */}');

fs.writeFileSync('src/components/Login.tsx', code);
