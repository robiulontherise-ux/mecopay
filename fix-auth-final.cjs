const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

code = code.replace(
  /supabase\.auth\.getUser\(\)\.then\(\(\{ data: \{ user \}, error \}\) => \{[\s\S]*?setUser\(user\);/,
  `supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        console.error('Auth verification failed:', error);
        alert('Session expired or invalid. Please log in again.');
        // Force clear local storage just in case signOut fails
        localStorage.clear();
        supabase.auth.signOut().then(() => {
          window.location.href = '/login';
        }).catch(() => {
          window.location.href = '/login';
        });
        return;
      }
      setUser(user);`
);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
