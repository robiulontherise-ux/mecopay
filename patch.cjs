const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');
code = code.replace("Identity Verification</h3>", "Identity Verification</h3></div>");
fs.writeFileSync('src/components/DashboardShell.tsx', code);
