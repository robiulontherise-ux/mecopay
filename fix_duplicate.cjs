const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

// Replace duplicate gateway_used blocks
content = content.replace(/gateway_used: selectedGateway\.provider,\n          gateway_used: selectedGateway\.provider,\n          gateway_used: selectedGateway\.provider,/g, 'gateway_used: selectedGateway.provider,');
content = content.replace(/gateway_used: selectedGateway\.provider,\n          gateway_used: selectedGateway\.provider,/g, 'gateway_used: selectedGateway.provider,');

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
