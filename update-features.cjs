const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// Speed up text animation
code = code.replace(/5500/g, '2750');
code = code.replace(/transition={{ duration: 1.2, delay: lineIndex \* 1.2, ease: "easeInOut" }}/g, 'transition={{ duration: 0.6, delay: lineIndex * 0.6, ease: "easeInOut" }}');
code = code.replace(/transition={{ duration: 0.5 }}/g, 'transition={{ duration: 0.25 }}');

// Update line diagram colors and make it pink
code = code.replace(/<div className="w-5 h-5 rounded-full bg-green-500 shadow-\[0_0_15px_rgba\(34,197,94,0\.6\)\] z-10 relative"><\/div>/, '<div className="w-5 h-5 rounded-full bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.8)] z-10 relative"></div>');

code = code.replace(/<svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">[\s\S]*?<\/svg>/, `<svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 50 0 L 16.66 100" stroke="#ec4899" strokeWidth="1.5" fill="none" className="opacity-80" />
              <path d="M 50 0 L 50 100" stroke="#ec4899" strokeWidth="1.5" fill="none" className="opacity-80" />
              <path d="M 50 0 L 83.33 100" stroke="#ec4899" strokeWidth="1.5" fill="none" className="opacity-80" />
            </svg>`);

// Update node text to match pink theme better if needed, keep it white but with pink shadow
code = code.replace(/<div className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl text-center w-1\/3 px-1 drop-shadow-md">/g, '<div className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl text-center w-1/3 px-1 drop-shadow-[0_2px_10px_rgba(236,72,153,0.5)]">');

// Update Marquee text
code = code.replace(/<span className="text-lg md:text-2xl font-bold text-neutral-300">Digital Product & Course Payment Automation <span className="mx-8 text-neutral-600">•<\/span> Physical Product Advance Payment System for Fraud Order Decrease <span className="mx-8 text-neutral-600">•<\/span><\/span>/g, '<span className="text-lg md:text-2xl font-bold text-neutral-300">ডিজিটাল প্রোডাক্ট ও কোর্স পেমেন্ট অটোমেশন <span className="mx-8 text-pink-500/50">•</span> ফিজিক্যাল প্রোডাক্ট অ্যাডভান্স পেমেন্ট সিস্টেম (ফ্রড অর্ডার কমাতে) <span className="mx-8 text-pink-500/50">•</span></span>');

// Update features title to Bengali
code = code.replace(/<h2 className="text-3xl md:text-4xl font-bold text-white mb-20 tracking-tight text-center">\s*Payment & Analytics Ecosystem\s*<\/h2>/, `<h2 className="text-3xl md:text-4xl font-bold text-white mb-20 tracking-tight text-center">
          পেমেন্ট এবং অ্যানালিটিক্স ইকোসিস্টেম
        </h2>`);

// Update Cards
const newCards = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
           <div className="bg-neutral-900/80 p-6 md:p-8 rounded-2xl border border-neutral-800 transition-all hover:border-pink-500/30 hover:bg-neutral-800/80 group">
             <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             </div>
             <h3 className="text-xl md:text-2xl font-bold text-white mb-4">আনলিমিটেড স্কেলিং</h3>
             <p className="text-base text-neutral-400 leading-relaxed">
               যাদের ট্রেড লাইসেন্স ও টিন (TIN) আছে, তারা মার্চেন্ট MFS, ব্যাংক বা কার্ড দিয়ে লিমিট ছাড়া পেমেন্ট রিসিভ করুন। ডিজিটাল ও ই-কমার্স ব্যবসার জন্য সম্পূর্ণ অটোমেশন।
             </p>
           </div>
           <div className="bg-neutral-900/80 p-6 md:p-8 rounded-2xl border border-neutral-800 transition-all hover:border-pink-500/30 hover:bg-neutral-800/80 group">
             <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
             </div>
             <h3 className="text-xl md:text-2xl font-bold text-white mb-4">ট্রেড লাইসেন্স নেই?</h3>
             <p className="text-base text-neutral-400 leading-relaxed">
               যাদের ট্রেড লাইসেন্স বা টিন নেই, তারা পার্সোনাল MFS দিয়ে খুব সহজেই পেমেন্ট রিসিভ করা শুরু করুন। আপনার ডিজিটাল আইডেন্টিটি তৈরি করুন ও ই-কমার্স শুরু করুন কোনো ঝামেলা ছাড়াই।
             </p>
           </div>
           <div className="bg-neutral-900/80 p-6 md:p-8 rounded-2xl border border-neutral-800 transition-all hover:border-pink-500/30 hover:bg-neutral-800/80 group">
             <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
             </div>
             <h3 className="text-xl md:text-2xl font-bold text-white mb-4">ফিজিক্যাল শপ ও অনলাইন</h3>
             <p className="text-base text-neutral-400 leading-relaxed">
               যাদের ফিজিক্যাল দোকান বা চেম্বার আছে, তারা ডিজিটাল হিসাব রাখার পাশাপাশি অনলাইনেও প্রোডাক্ট সেল করতে পারবেন। সাথে থাকছে বাংলা QR দিয়ে সরাসরি পেমেন্ট নেয়ার সুবিধা।
             </p>
           </div>
        </div>`;

code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">[\s\S]*?<\/div>\s*<\/section>/, newCards + '\n      </section>');

fs.writeFileSync('src/components/Login.tsx', code);
