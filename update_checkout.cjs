const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update handleBackFromStep4 to make it async and update status
const handleBackStr = `  const handleBackFromStep4 = () => {
    const vTrxId = brandData?.redirect_links?.verify_trx_id ?? true;
    const vPhone = brandData?.redirect_links?.verify_phone ?? false;
    const skippedStep3 = (vTrxId && !vPhone) || (!vTrxId && vPhone) || (!vTrxId && !vPhone);
    
    if (verifyMethod === 'offline' || skippedStep3) {
      setStep(2);
    } else {
      setStep(3);
    }
  };`;

const newHandleBackStr = `  const handleCancelPayment = async () => {
    // User explicitly clicked Cancel / Close on Gateway page
    if (invoiceId) {
      // Background update
      supabase.from('invoices').update({ status: 'Cancelled' }).eq('id', invoiceId).then();
    }
    
    const vTrxId = brandData?.redirect_links?.verify_trx_id ?? true;
    const vPhone = brandData?.redirect_links?.verify_phone ?? false;
    const skippedStep3 = (vTrxId && !vPhone) || (!vTrxId && vPhone) || (!vTrxId && !vPhone);
    
    if (verifyMethod === 'offline' || skippedStep3) {
      setStep(2);
    } else {
      setStep(3);
    }
  };`;

content = content.replace(handleBackStr, newHandleBackStr);

// 2. Replace handleBackFromStep4 with handleCancelPayment in JSX
content = content.replace(/handleBackFromStep4/g, 'handleCancelPayment');

// 3. Update the other "Back" buttons to also log if needed, wait, user said "ar back korle tao bole dibe just invoice er jonno eta Koro final".
// The other back buttons are `setStep(1)` and `setStep(2)`.
content = content.replace(
  'onClick={() => setStep(1)} className="text-sm font-medium text-slate-500 hover:text-slate-700">Back</button>',
  `onClick={() => {
                      if (invoiceId) supabase.from('invoices').update({ status: 'Returned to Form' }).eq('id', invoiceId).then();
                      setStep(1);
                    }} className="text-sm font-medium text-slate-500 hover:text-slate-700">Back</button>`
);

content = content.replace(
  'onClick={() => setStep(2)} className="text-sm font-medium text-slate-500 hover:text-slate-700">Back</button>',
  `onClick={() => {
                      if (invoiceId) supabase.from('invoices').update({ status: 'Returned to Method' }).eq('id', invoiceId).then();
                      setStep(2);
                    }} className="text-sm font-medium text-slate-500 hover:text-slate-700">Back</button>`
);

// 4. In Step 5, there is also a Cancel/Close button
content = content.replace(
  'onClick={() => setStep(4)} className={`flex-1 py-3.5 rounded-lg font-bold ${gConfig.btnSecondary}`}>',
  `onClick={() => {
                        if (invoiceId) supabase.from('invoices').update({ status: 'Cancelled' }).eq('id', invoiceId).then();
                        setStep(4);
                      }} className={\`flex-1 py-3.5 rounded-lg font-bold \${gConfig.btnSecondary}\`}>`
);

fs.writeFileSync(file, content);
