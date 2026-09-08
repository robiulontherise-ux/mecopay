const fs = require('fs');
const file = '/app/applet/src/mysite/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove ADMIN_EMAIL import
code = code.replace(/import \{ supabase, ADMIN_EMAIL \} from '\.\/lib\/supabaseClient';/, "import { supabase } from './lib/supabaseClient';");

// 2. Update isAdmin logic
code = code.replace(/const isAdmin = user\?\.email\?\.trim\(\)\.toLowerCase\(\) === ADMIN_EMAIL\.toLowerCase\(\);/, "const isAdmin = user && siteSettings?.client_id && user.id === siteSettings.client_id;");

// 3. Update auth redirect logic to check ownership dynamically
const oldAuth = `if (_event === 'SIGNED_IN') {
           const isUserAdmin = session.user.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
           if (isUserAdmin) {
             setCurrentView('admin');
             window.location.hash = 'admin';
           }
        }`;

const newAuth = `if (_event === 'SIGNED_IN') {
           // Fetch current site settings to see if the logged-in user is the owner
           supabase.from('site_settings').select('client_id').eq('id', 'default').limit(1).maybeSingle().then(({data}) => {
             if (data && data.client_id === session.user.id) {
               setCurrentView('admin');
               window.location.hash = 'admin';
             }
           });
        }`;
code = code.replace(oldAuth, newAuth);

// 4. Update simulated user fallback logic
code = code.replace(/full_name: simEmail === ADMIN_EMAIL \? 'BUET DMC Dreamers Super Admin' : 'Enrolled Student',/g, "full_name: 'Simulated User',");
code = code.replace(/full_name: email === ADMIN_EMAIL \? 'BUET DMC Dreamers Super Admin' : email\.split\('@'\)\[0\],/, "full_name: email.split('@')[0],");

// 5. Update alert message
code = code.replace(/alert\(\`Access Restricted\. The Admin Panel is exclusively accessible by \$\{ADMIN_EMAIL\}\.\`\);/, "alert('Access Restricted. You are not the owner of this website.');");

// 6. Update Admin Panel fallback userEmail
code = code.replace(/userEmail=\{user\?\.email \|\| ADMIN_EMAIL\}/, "userEmail={user?.email || 'admin@example.com'}");

fs.writeFileSync(file, code);
