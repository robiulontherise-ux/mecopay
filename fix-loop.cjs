const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

code = code.replace(
  /if \(error \|\| !user\) \{[\s\S]*?return;\n\s*\}/,
  `if (error || !user) {
        console.error('getUser error:', error);
        supabase.auth.signOut();
        return;
      }`
);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
