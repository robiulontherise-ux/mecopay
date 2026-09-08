const fs = require('fs');
const file = '/app/applet/src/mysite/App.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldAuth = `} = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (window.opener && window.location.hash.includes('access_token')) {
          setTimeout(() => window.close(), 500);
        }
      } else {`;

const newAuth = `} = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (window.opener && window.location.hash.includes('access_token')) {
          setTimeout(() => window.close(), 500);
        }
        // Redirect to admin panel on login
        if (_event === 'SIGNED_IN') {
           setCurrentView('admin');
           window.location.hash = 'admin';
        }
      } else {`;

code = code.replace(oldAuth, newAuth);
fs.writeFileSync(file, code);
