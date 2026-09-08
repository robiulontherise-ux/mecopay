const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

// The original was bg-[#ED1C24], I changed it to bg-[#B31A1B]
// Let's change it back to a slightly richer red that matches the screenshot, like bg-[#D12027] or bg-[#E62E2D]
// Actually, Nagad's exact official red is #EC1C24. Let's try #ED1C24 or maybe a gradient?
// Screenshot 2 shows a solid vibrant red. Let's use #F22336 (a very vibrant red often seen on their screens)
content = content.replace(/bg-\[#B31A1B\]/g, 'bg-[#ED1C24]');
content = content.replace(/text-\[#B31A1B\]/g, 'text-[#ED1C24]');
content = content.replace(/border-\[#B31A1B\]/g, 'border-[#ED1C24]');
content = content.replace(/from-\[#B31A1B\]/g, 'from-[#ED1C24]');
content = content.replace(/to-\[#B31A1B\]/g, 'to-[#ED1C24]');

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched Nagad color back to vibrant red");
