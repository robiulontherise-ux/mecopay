const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

content = content.replace(
  "items: ['Profile', 'Dashboard', 'Service & Billing', 'Brand', 'Webhook Settings', 'Plugins & Apps', 'Developer Docs', 'Analytics'],",
  "items: ['Profile', 'Dashboard', 'Service & Billing', 'Brand', 'Webhook Settings', 'Plugins & Apps', 'Developer Docs'],"
);

content = content.replace(
  "items: ['Gateway Settings', 'Payment Links', 'Invoices', 'Transactions', 'Transaction Analysis'],",
  "items: ['Gateway Settings', 'Payment Links', 'Invoices', 'Transactions', 'Transaction Analysis', 'Analytics'],"
);

fs.writeFileSync('src/components/DashboardShell.tsx', content);
console.log("Patched menuData");
