const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const isAdminLine = `  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL || user?.email === 'robiulontherise@gmail.com';`;

code = code.replace(isAdminLine, '');

// Insert it right after `const [user, setUser] = useState<any>(null);`
code = code.replace(
  `const [user, setUser] = useState<any>(null);`,
  `const [user, setUser] = useState<any>(null);\n${isAdminLine}`
);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
