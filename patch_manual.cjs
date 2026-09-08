const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

const amountCheck = `      if (smsData) {
        // CHECK AMOUNT
        if (smsData.amount_extracted && smsData.amount_extracted < checkoutAmounts.total) {
          showToast("Amount mismatch! Paid amount is less than required.", "error");
          setIsVerifying(false);
          return;
        }`;

content = content.replace("      if (smsData) {", amountCheck);

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched manual verify");
