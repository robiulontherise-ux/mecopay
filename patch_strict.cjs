const fs = require('fs');

let serverContent = fs.readFileSync('server.ts', 'utf8');
serverContent = serverContent.replace(
  "if (sms.amount_extracted && sms.amount_extracted < invoice.amount) {",
  "if (!sms.amount_extracted || sms.amount_extracted < invoice.amount) {"
);
fs.writeFileSync('server.ts', serverContent);

let checkoutContent = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');
checkoutContent = checkoutContent.replace(
  "if (smsData.amount_extracted && smsData.amount_extracted < checkoutAmounts.total) {",
  "if (!smsData.amount_extracted || smsData.amount_extracted < checkoutAmounts.total) {"
);
fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', checkoutContent);

console.log("Patched both to strict amount checking");
