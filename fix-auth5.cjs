const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

code = code.replace(
  /supabase\.auth\.getUser\(\)\.then\(\(\{ data: \{ user \}, error \}\) => \{[\s\S]*?setUser\(user\);/,
  `supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        console.error('Auth verification failed:', error);
        // Do not sign out automatically, show an error alert to the user so they see what happened.
        alert('Auth Error: ' + (error?.message || 'User not found in Supabase'));
        return;
      }
      setUser(user);`
);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
