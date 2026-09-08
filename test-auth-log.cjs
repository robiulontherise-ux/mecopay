const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

code = code.replace(
  "console.error('Auth error:', error);",
  "console.error('Auth error:', error, 'session:', session);"
);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
