const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/AccessPage.tsx', 'utf-8');

content = content.replace(
  'const targetLink = invoice.redirect_link || invoice.payment_links?.redirect_link;',
  'const targetLink = invoice.redirect_link || (Array.isArray(invoice.payment_links) ? invoice.payment_links[0]?.redirect_link : (invoice.payment_links as any)?.redirect_link);'
);

fs.writeFileSync('src/components/checkout/AccessPage.tsx', content);
