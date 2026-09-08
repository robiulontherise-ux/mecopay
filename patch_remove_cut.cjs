const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const absoluteButton = `              {/* Cut Invoice Button */}
              <button 
                onClick={async () => {
                   if (invoiceId) {
                     await supabase.from('invoices').update({ status: 'Cut Invoice' }).eq('id', invoiceId);
                   }
                   setStep(1); // Go back to start
                }}
                className="absolute top-4 right-4 z-50 flex items-center gap-1.5 text-xs font-bold bg-black/20 hover:bg-black/40 text-white px-3 py-1.5 rounded-full shadow-lg transition-colors backdrop-blur-md border border-white/10"
                title="Cut Invoice (I can't pay)"
              >
                <X className="w-3.5 h-3.5" /> Cut Invoice
              </button>
            `;

if (content.includes(absoluteButton)) {
  content = content.replace(absoluteButton, '');
} else {
  // Try regex
  const re = /\{\/\* Cut Invoice Button \*\/\}\s*<button[\s\S]*?<\/button>/;
  content = content.replace(re, '');
}

fs.writeFileSync(file, content);
