const fs = require('fs');
const map = JSON.parse(fs.readFileSync('dist/assets/index-BF8M-1tS.js.map', 'utf8'));
const index = map.sources.findIndex(s => s.includes('CheckoutPage.tsx'));
if (index !== -1) {
    fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', map.sourcesContent[index]);
    console.log('Recovered!');
} else {
    console.log('Not found in sources');
}
