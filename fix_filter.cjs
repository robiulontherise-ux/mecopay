const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf8');
content = content.replace('gateways.map((gw, idx) => {', 'gateways.filter(gw => brands.some(b => b.id === gw.brand_id)).map((gw, idx) => {');
fs.writeFileSync('src/components/payment-hub/GatewaySettings.tsx', content);

let content2 = fs.readFileSync('src/components/payment-hub/PaymentLinks.tsx', 'utf8');
content2 = content2.replace('paymentLinks.map((link, idx) => {', 'paymentLinks.filter(link => brands.some(b => b.id === link.website_id)).map((link, idx) => {');
fs.writeFileSync('src/components/payment-hub/PaymentLinks.tsx', content2);
