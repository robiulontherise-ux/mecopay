const fs = require('fs');
let dbShell = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');
dbShell = dbShell.replace(
  /gatewayNumbers\.reduce\(\(acc, gw\) => \{/g,
  `gatewayNumbers.filter((gw: any) => gw.brand_id).reduce((acc: any, gw: any) => {`
);
fs.writeFileSync('src/components/DashboardShell.tsx', dbShell);
