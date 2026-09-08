const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `              {/* Cut Invoice Link - Bottom Center */}
              <div className="py-2 flex justify-center border-t border-black/5 bg-black/5">
                <button 
                  onClick={async () => {
                     if (invoiceId) {
                       await supabase.from('invoices').update({ status: 'Cut Invoice' }).eq('id', invoiceId);
                     }
                     setStep(1); // Go back to start
                     window.location.reload(); // Hard reload to clear all states
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cut Invoice (I can't pay)
                </button>
              </div>`;

const newStr = `              {/* Cut Invoice Link - Bottom Center */}
              <button 
                onClick={async () => {
                   if (invoiceId) {
                     await supabase.from('invoices').update({ status: 'Cut Invoice' }).eq('id', invoiceId);
                   }
                   setStep(1);
                   window.location.reload();
                }}
                className="w-full py-3.5 flex justify-center items-center border-t border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors group"
              >
                <div className="text-[13px] font-bold text-red-600 flex items-center gap-2 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> 
                  {lang === 'EN' ? "Cancel & Cut Invoice" : "পেমেন্ট বাতিল করুন (Cut Invoice)"}
                </div>
              </button>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(file, content);
  console.log("Patched Cut Invoice style");
} else {
  console.log("Could not find target string for Cut Invoice style");
}
