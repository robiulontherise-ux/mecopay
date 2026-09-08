const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="text-sm font-bold opacity-90 mb-6">Session expires in {formatTime(timeLeft)}</div>`;

const newStr = `<div className="text-sm font-bold opacity-90 mb-4">Session expires in {formatTime(timeLeft)}</div>
                    <div className="inline-flex items-center gap-3 bg-white/20 px-4 py-2.5 rounded-lg backdrop-blur-sm shadow-sm border border-white/20 mb-4 animate-in fade-in zoom-in duration-500 text-left">
                      <div className="bg-white/20 p-1.5 rounded-full">
                         <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-xs text-white leading-tight">
                        <span className="block font-extrabold text-[13px] mb-0.5">দয়া করে এই পেজটি কাটবেন না</span>
                        <span className="opacity-90">আপনার পেমেন্টটি স্বয়ংক্রিয়ভাবে ভেরিফাই হচ্ছে</span>
                      </div>
                    </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(file, content);
  console.log("Patched checkout info text successfully.");
} else {
  console.log("Could not find target string.");
}
