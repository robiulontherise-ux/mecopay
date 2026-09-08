const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

code = code.replace(
  "if (error || !user) {",
  "if (error || !user) {\n        console.error('getUser error:', error);\n        alert('Session validation failed: ' + (error?.message || 'User not found'));"
);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
