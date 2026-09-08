const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "status: 'Returned to Form'",
  "status: 'Returned to Form (from Gateway)'"
);

content = content.replace(
  "status: 'Returned to Method'",
  "status: 'Returned to Gateway (from Verification)'"
);

fs.writeFileSync(file, content);
