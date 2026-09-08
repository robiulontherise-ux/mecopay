const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace("import DashboardShell from './components/DashboardShell';", "import DashboardRoute from './components/DashboardRoute';");
code = code.replace(/<DashboardShell \/>/g, "<DashboardRoute />");

fs.writeFileSync('src/App.tsx', code);
