const fs = require('fs');
const file = 'src/components/payment-hub/GatewaySettings.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the mismatched divs.
let openDivs = (content.match(/<div/g) || []).length;
let closeDivs = (content.match(/<\/div>/g) || []).length;
console.log('GatewaySettings Divs:', { openDivs, closeDivs });

const file2 = 'src/components/payment-hub/PaymentLinks.tsx';
let content2 = fs.readFileSync(file2, 'utf8');
let openDivs2 = (content2.match(/<div/g) || []).length;
let closeDivs2 = (content2.match(/<\/div>/g) || []).length;
console.log('PaymentLinks Divs:', { openDivs2, closeDivs2 });
