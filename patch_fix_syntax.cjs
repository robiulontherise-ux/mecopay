const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

content = content.replace(
  /<div className="text-center font-bold mb-4 text-lg mt-8">ট্রানজেকশন আইডি দিন<\/div>/g,
  `</div>\n                      <div className="text-center font-bold mb-4 text-lg mt-8">ট্রানজেকশন আইডি দিন</div>`
);

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Fixed syntax error");
