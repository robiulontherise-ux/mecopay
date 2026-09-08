const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');
code = code.replace("{/* Web & Social Profiles */}", "</div>{/* Web & Social Profiles */}");
fs.writeFileSync('src/components/DashboardShell.tsx', code);
