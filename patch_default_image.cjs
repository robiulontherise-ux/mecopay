const fs = require('fs');

let pl = fs.readFileSync('src/components/payment-hub/PaymentLinks.tsx', 'utf-8');

// When saving, if imageUrl is empty, we can just save empty, but let's default it when rendering.
pl = pl.replace(
  /\{link\.product_image \? \(/,
  `{(link.product_image && link.product_image.trim() !== '') ? (`
);
pl = pl.replace(
  /<div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">\s*📦\s*<\/div>/,
  `<img src="https://i.postimg.cc/qqKpCcqV/BCO-3cfd8d70-7be6-4f9d-bcbe-c113f06c17da.png" alt="Default Product" className="w-10 h-10 rounded-lg object-cover bg-slate-800" />`
);

fs.writeFileSync('src/components/payment-hub/PaymentLinks.tsx', pl);

let checkout = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');
checkout = checkout.replace(
  /\{productData\?.product_image \? \(\s*<img src=\{productData\.product_image\}\s*alt=\{productData\.product_name\}\s*className="w-16 h-16 rounded-xl object-cover shadow-sm bg-slate-100 \/dark:bg-slate-800"\s*\/>\s*\) : \(\s*<div className="w-16 h-16 rounded-xl bg-slate-100 \/dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">\s*<Package className="w-8 h-8" \/>\s*<\/div>\s*\)\}/g,
  `<img src={productData?.product_image || "https://i.postimg.cc/qqKpCcqV/BCO-3cfd8d70-7be6-4f9d-bcbe-c113f06c17da.png"} alt={productData?.product_name || 'Product'} className="w-16 h-16 rounded-xl object-cover shadow-sm bg-slate-100 dark:bg-slate-800" />`
);

// We must be careful because my regex might not perfectly match. Let's do string replacement instead or safer regex.
