const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

code = code.replace(
  "{user?.email?.charAt(0).toUpperCase()}",
  "{(user?.email || 'U').charAt(0).toUpperCase()}"
);

code = code.replace(
  "{user?.email?.charAt(0).toUpperCase()}",
  "{(user?.email || 'U').charAt(0).toUpperCase()}"
);

code = code.replace(
  "{activeBrand.name?.charAt(0).toUpperCase()}",
  "{(activeBrand.name || 'B').charAt(0).toUpperCase()}"
);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
