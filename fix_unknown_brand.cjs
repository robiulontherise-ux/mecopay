const fs = require('fs');

let dbShell = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// 1. Hide gateways with no brand from the Gateway Tracker warnings
dbShell = dbShell.replace(
  /const isPersonal = gw\.type === 'personal' \|\| !gw\.type;\n\s*if \(!isPersonal\) return;/,
  `const isPersonal = gw.type === 'personal' || !gw.type;\n                   if (!isPersonal || !gw.brand_id) return;`
);

// 2. Hide gateways with no brand from the Gateway Tracker UI list
dbShell = dbShell.replace(
  /Object\.entries\(\s*gatewayNumbers\.reduce\(\(acc: any, gw: any\) => \{/,
  `Object.entries(
                   gatewayNumbers.filter((gw: any) => gw.brand_id).reduce((acc: any, gw: any) => {`
);

fs.writeFileSync('src/components/DashboardShell.tsx', dbShell);
