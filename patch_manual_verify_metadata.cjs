const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

const targetCheckAmount = `        // CHECK AMOUNT
        const isOverpaymentAllowed = brandData?.payment_amount_type === 'allow_overpayment';
        
        if (!smsData.amount_extracted || smsData.amount_extracted < checkoutAmounts.total) {
          setVerifyError("Amount mismatch! Paid amount is less than required.");
          setIsVerifying(false);
          return;
        }`;

const newCheckAmount = `        // CHECK AMOUNT
        const isOverpaymentAllowed = brandData?.payment_amount_type === 'allow_overpayment';
        
        if (!smsData.amount_extracted || smsData.amount_extracted < checkoutAmounts.total) {
          await supabase.from('invoices').update({ metadata: { note: "Amount mismatch! Paid amount is less than required." } }).eq('id', invoiceId);
          setVerifyError("Amount mismatch! Paid amount is less than required.");
          setIsVerifying(false);
          return;
        }`;

if (content.includes(targetCheckAmount)) {
  content = content.replace(targetCheckAmount, newCheckAmount);
}

const targetOverpayment = `        if (!isOverpaymentAllowed && smsData.amount_extracted > checkoutAmounts.total) {
          setVerifyError("Amount mismatch! Overpayment is not allowed. Please contact support.");
          setIsVerifying(false);
          return;
        }`;

const newOverpayment = `        if (!isOverpaymentAllowed && smsData.amount_extracted > checkoutAmounts.total) {
          await supabase.from('invoices').update({ metadata: { note: "Amount mismatch! Overpayment is not allowed." } }).eq('id', invoiceId);
          setVerifyError("Amount mismatch! Overpayment is not allowed. Please contact support.");
          setIsVerifying(false);
          return;
        }`;

if (content.includes(targetOverpayment)) {
  content = content.replace(targetOverpayment, newOverpayment);
}

const targetNotFound = `      } else {
         if (isDeviceOnline) {
           setVerifyError("Transaction ID not match! Please give accurate TrxID.");
           setIsVerifying(false);
           return;
         }
      }`;

const newNotFound = `      } else {
         await supabase.from('invoices').update({ metadata: { note: "No SMS event found for this transaction ID. Verify manually." } }).eq('id', invoiceId);
         if (isDeviceOnline) {
           setVerifyError("Transaction ID not match! Please give accurate TrxID.");
           setIsVerifying(false);
           return;
         }
      }`;

if (content.includes(targetNotFound)) {
  content = content.replace(targetNotFound, newNotFound);
}

const targetProviderMismatch = `        } else {
           if (isDeviceOnline) {
             setVerifyError("Transaction ID not match! Please give accurate TrxID.");
             setIsVerifying(false);
             return;
           }
        }`;

const newProviderMismatch = `        } else {
           await supabase.from('invoices').update({ metadata: { note: "Transaction ID found, but provider does not match. Verify manually." } }).eq('id', invoiceId);
           if (isDeviceOnline) {
             setVerifyError("Transaction ID not match! Please give accurate TrxID.");
             setIsVerifying(false);
             return;
           }
        }`;

if (content.includes(targetProviderMismatch)) {
  content = content.replace(targetProviderMismatch, newProviderMismatch);
}

const targetAlreadyUsed = `        if (smsData.status === 'matched') {
          if (isDeviceOnline) {
             setVerifyError("This Transaction ID has already been used!");
             setIsVerifying(false);
             return;
          } else {
             // If device offline, we could theoretically let them submit, but since we already KNOW it's used, 
             // it's better to reject it anyway. But to maintain the offline behavior, we'll reject it regardless of online/offline status because we have proof it's used.
             setVerifyError("This Transaction ID has already been used!");
             setIsVerifying(false);
             return;
          }
        }`;

const newAlreadyUsed = `        if (smsData.status === 'matched') {
          await supabase.from('invoices').update({ metadata: { note: "This Transaction ID has already been used on another invoice!" } }).eq('id', invoiceId);
          if (isDeviceOnline) {
             setVerifyError("This Transaction ID has already been used!");
             setIsVerifying(false);
             return;
          } else {
             // If device offline, we could theoretically let them submit, but since we already KNOW it's used, 
             // it's better to reject it anyway. But to maintain the offline behavior, we'll reject it regardless of online/offline status because we have proof it's used.
             setVerifyError("This Transaction ID has already been used!");
             setIsVerifying(false);
             return;
          }
        }`;

if (content.includes(targetAlreadyUsed)) {
  content = content.replace(targetAlreadyUsed, newAlreadyUsed);
}

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched metadata updates in CheckoutPage.tsx");
