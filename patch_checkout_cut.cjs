const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `          {/* Gateway Specific Body for Steps 4 & 5 */}
          {step >= 4 && step < 6 && (
            <div className={\`flex-1 \${gConfig.bodyBg} \${gConfig.bodyText} flex flex-col relative\`}>`;

const replacementStr = `          {/* Gateway Specific Body for Steps 4 & 5 */}
          {step >= 4 && step < 6 && (
            <div className={\`flex-1 \${gConfig.bodyBg} \${gConfig.bodyText} flex flex-col relative\`}>
              {/* Cut Invoice Button */}
              <button 
                onClick={async () => {
                   if (invoiceId) {
                     await supabase.from('invoices').update({ status: 'Cut Invoice' }).eq('id', invoiceId);
                   }
                   setStep(1); // Go back to start
                }}
                className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-xs font-bold bg-black/20 hover:bg-black/40 text-white px-3 py-1.5 rounded-full shadow-lg transition-colors backdrop-blur-md border border-white/10"
                title="Cut Invoice (I can't pay)"
              >
                <X className="w-3.5 h-3.5" /> Cut Invoice
              </button>
              `;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content);
