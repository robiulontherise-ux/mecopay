const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

content = content.replace(/gateway_number: selectedGateway\.number,/g, 'gateway_number: selectedGateway.number,\n          gateway_used: selectedGateway.provider,');

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
