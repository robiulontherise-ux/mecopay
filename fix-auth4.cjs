const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// Use getUser() as it validates the session with the server.
code = code.replace(
  /supabase\.auth\.getSession\(\)\.then\(\(\{ data: \{ session \}, error \}\) => \{[\s\S]*?setUser\(user\);/,
  `supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        console.error('Auth verification failed:', error);
        // Clear invalid session to stop the redirect loop
        supabase.auth.signOut().then(() => navigate('/login'));
        return;
      }
      setUser(user);`
);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
