const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

// fix redirect for live polling block
content = content.replace(/if \(data\.success && data\.redirect_link\) \{\n\s*window\.location\.href = data\.redirect_link;\n\s*\}/g, 
  "if (data.success) { window.location.href = data.redirect_url || data.delivery?.url || data.redirect_link || '/access/' + invoiceId; }"
);

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
