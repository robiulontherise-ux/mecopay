const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

const targetStr = `        if (providerMatched) {
          // Match found and verified instantly!
        await supabase.from('invoices').update({ status: 'Completed' }).eq('id', invoiceId);
        await supabase.from('sms_events').update({ status: 'matched', invoice_id: invoiceId }).eq('id', smsData.id);
        
        // Redirect to secure access page immediately
        window.location.href = '/access/' + invoiceId;
        return;
        }
      }

      setStep(6);`;

const newStr = `        if (providerMatched) {
          // Match found and verified instantly!
          await supabase.from('invoices').update({ status: 'Completed' }).eq('id', invoiceId);
          await supabase.from('sms_events').update({ status: 'matched', invoice_id: invoiceId }).eq('id', smsData.id);
          
          // Redirect to secure access page immediately
          window.location.href = '/access/' + invoiceId;
          return;
        } else {
           if (isDeviceOnline) {
             showToast("Transaction ID not match! Please give accurate TrxID.", "error");
             setIsVerifying(false);
             return;
           }
        }
      } else {
         if (isDeviceOnline) {
           showToast("Transaction ID not match! Please give accurate TrxID.", "error");
           setIsVerifying(false);
           return;
         }
      }

      setStep(6);`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, newStr);
    fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
    console.log("Patched TrxID logic successfully.");
} else {
    console.log("Target string not found. Please check exact spacing.");
}
