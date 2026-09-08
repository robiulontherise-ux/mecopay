const fs = require('fs');
let file = 'src/components/DashboardShell.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '{gatewayNumbers.length === 0 ? (',
  '{gatewayNumbers.filter((gw: any) => gw.brand_id).length === 0 ? ('
);

content = content.replace(
  'gatewayNumbers.reduce((acc: any, gw: any) => {',
  'gatewayNumbers.filter((gw: any) => gw.brand_id).reduce((acc: any, gw: any) => {'
);

fs.writeFileSync(file, content);
