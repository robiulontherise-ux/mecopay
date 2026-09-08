const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

// Replace the Upay footer bg
content = content.replace(
  /<div className=\{\`mt-auto p-4 flex gap-4 \$\{providerKey === 'upay' \? 'bg-slate-100 rounded-b-2xl border-t border-black\/10' : ''\}\`\}>/g,
  `<div className={\`mt-auto p-4 flex gap-4 \${providerKey === 'upay' ? 'border-t border-black/10' : ''}\`}>`
);

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched upay footer");
