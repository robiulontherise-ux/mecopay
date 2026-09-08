const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

code = code.replace(
  "supabase.auth.getUser().then(({ data: { user }, error }) => {",
  "supabase.auth.getSession().then(({ data: { session }, error }) => {\n      const user = session?.user;"
);

code = code.replace(
  /if \(error \|\| !user\) \{[\s\S]*?return;\n\s*\}/,
  `if (error || !user) {
        console.error('Auth error:', error);
        supabase.auth.signOut().then(() => navigate('/login'));
        return;
      }`
);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
