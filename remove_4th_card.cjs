const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

code = code.replace('className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left"', 'className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"');

const card4 = `
           <div className="bg-neutral-900/80 p-6 md:p-8 rounded-2xl border border-neutral-800 transition-all hover:border-emerald-500/30 hover:bg-neutral-800/80 group">
             <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
             </div>
             <h3 className="text-3xl md:text-4xl font-black text-white mb-4">No-Code ওয়েবসাইট</h3>
             <p className="text-xl text-neutral-400 leading-relaxed">
               কোনো কোডিং জ্ঞান ছাড়াই প্রফেশনাল ই-কমার্স ওয়েবসাইট তৈরি করুন। আমাদের No-Code বিল্ডার ব্যবহার করে খুব সহজেই আপনার ওয়েবসাইট কাস্টমাইজ করুন এবং অনলাইনে প্রোডাক্ট সেল শুরু করুন।
             </p>
           </div>`;

code = code.replace(card4, "");
fs.writeFileSync('src/components/Login.tsx', code);
console.log('4th card removed');
