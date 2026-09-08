const fs = require('fs');
let file = 'src/components/payment-hub/GatewaySettings.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove .not('brand_id', 'is', null)
content = content.replace(/\.not\('brand_id', 'is', null\)\s*/g, '');

fs.writeFileSync(file, content);

file = 'src/components/DashboardShell.tsx';
content = fs.readFileSync(file, 'utf8');

// In DashboardShell, let's restore showing unassigned gateways or at least let them be visible so they don't look "deleted"
content = content.replace(/\.filter\(\(gw: any\) => gw\.brand_id\)/g, '');

fs.writeFileSync(file, content);
