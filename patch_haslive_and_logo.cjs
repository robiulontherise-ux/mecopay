const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

// 1. Force hasLive and hasTrxId to true for ALL gateways to stop skipping Step 3
content = content.replace(
  /const hasLive = brandData\?\.redirect_links\?\.verify_phone;/g,
  'const hasLive = true; // brandData?.redirect_links?.verify_phone;'
);
content = content.replace(
  /const hasTrxId = brandData\?\.redirect_links\?\.verify_trx_id !== false;/g,
  'const hasTrxId = true; // brandData?.redirect_links?.verify_trx_id !== false;'
);

// 2. Fix the top logo in Step 4/5
const oldLogoCode = `{brandData?.logo_url ? (
                   <img src={brandData.logo_url} alt={brandData.name} className="h-12 w-12 object-cover rounded-full shadow-sm mb-4" />
                 ) : (
                   <ShoppingCart className="w-12 h-12 mb-4 opacity-80" />
                 )}`;
                 
const newLogoCode = `{providerKey === 'nagad' ? (
                   brandData?.logo_url ? (
                     <img src={brandData.logo_url} alt={brandData.name} className="h-12 w-12 object-cover rounded-full shadow-sm mb-4" />
                   ) : (
                     <ShoppingCart className="w-12 h-12 mb-4 opacity-80" />
                   )
                 ) : (
                   <img src={logoUrl} alt={selectedGateway.provider} className="h-12 object-contain mb-4" />
                 )}`;

content = content.replace(oldLogoCode, newLogoCode);

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log('Patch applied successfully');
