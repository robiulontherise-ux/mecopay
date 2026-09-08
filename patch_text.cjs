const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');
content = content.replace(/2 hours/g, "24 hours");
content = content.replace(/২ ঘণ্টা/g, "২৪ ঘণ্টা");
fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched 2 hours to 24 hours in UI.");
