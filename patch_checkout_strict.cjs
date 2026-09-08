const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

const targetCheck = `        // CHECK AMOUNT
        if (!smsData.amount_extracted || smsData.amount_extracted < checkoutAmounts.total) {
          setVerifyError("Amount mismatch! Paid amount is less than required.");
          setIsVerifying(false);
          return;
        }`;

const newCheck = `        // CHECK AMOUNT
        const isOverpaymentAllowed = brandData?.payment_amount_type === 'allow_overpayment';
        
        if (!smsData.amount_extracted || smsData.amount_extracted < checkoutAmounts.total) {
          setVerifyError("Amount mismatch! Paid amount is less than required.");
          setIsVerifying(false);
          return;
        }
        
        if (!isOverpaymentAllowed && smsData.amount_extracted > checkoutAmounts.total) {
          setVerifyError("Amount mismatch! Overpayment is not allowed. Please contact support.");
          setIsVerifying(false);
          return;
        }`;

if (content.includes(targetCheck)) {
  content = content.replace(targetCheck, newCheck);
  fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
  console.log("CheckoutPage.tsx patched");
} else {
  console.log("Could not find targetCheck in CheckoutPage.tsx");
  console.log(content.substring(content.indexOf('// CHECK AMOUNT') - 100, content.indexOf('// CHECK AMOUNT') + 200));
}
