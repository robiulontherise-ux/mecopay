const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `              </div>

              {/* Upay Footer Logo */}`;

const insertStr = `              </div>
              
              {/* Cut Invoice Link - Bottom Center */}
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
              </div>

              {/* Upay Footer Logo */}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, insertStr);
  fs.writeFileSync(file, content);
  console.log("Patched Cut Invoice at bottom");
} else {
  console.log("Could not find target string for bottom cut invoice");
}
