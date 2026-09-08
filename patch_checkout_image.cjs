const fs = require('fs');
let checkout = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');
checkout = checkout.replace(
  /\{linkData\?\.product_image \? \([\s\S]*?<\/div>\s*\)\}/,
  `<img src={linkData?.product_image || "https://i.postimg.cc/qqKpCcqV/BCO-3cfd8d70-7be6-4f9d-bcbe-c113f06c17da.png"} alt={linkData?.product_name || 'Product'} className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700" />`
);
fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', checkout);
