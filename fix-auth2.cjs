const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

code = code.replace(
  /supabase\.auth\.getSession\(\)\.then\(\(\{ data: \{ session \}, error \}\) => \{[\s\S]*?setUser\(user\);/,
  `supabase.auth.getSession().then(({ data: { session }, error }) => {
      const user = session?.user;
      if (error || !user) {
        console.error('DashboardShell auth error or no user:', error, 'session:', session);
        // Do not sign out here, just let App.tsx handle the session state
        navigate('/login');
        return;
      }
      setUser(user);`
);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
