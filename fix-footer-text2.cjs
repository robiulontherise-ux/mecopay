const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const oldFooter = `      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-10 text-center mt-12">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-sm font-semibold">
          <a href="/privacy-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">প্রাইভেসি পলিসি</a>
          <a href="/terms-conditions" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">শর্তাবলী</a>
          <a href="/refund-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">রিফান্ড পলিসি</a>
        </div>`;

const newFooter = `      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-10 text-center mt-12">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-sm font-semibold">
          <a href="/privacy-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">প্রাইভেসি পলিসি</a>
          <a href="/terms-conditions" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">শর্তাবলী</a>
          <a href="/refund-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">কাস্টমার রাইটস ও অ্যান্টি-ফ্রড</a>
        </div>`;

code = code.replace(oldFooter, newFooter);
fs.writeFileSync('src/components/Login.tsx', code);
