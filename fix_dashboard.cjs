const fs = require('fs');
let dbShell = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');
dbShell = dbShell.replace(
  /checkboxLabel: "Also delete associated Gateways",\n\s*defaultCheckbox: true/,
  `checkboxLabel: "Also delete associated Gateways",\n      defaultCheckbox: false`
);
fs.writeFileSync('src/components/DashboardShell.tsx', dbShell);
