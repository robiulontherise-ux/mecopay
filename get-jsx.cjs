const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');
const start = code.indexOf('<h3 className="text-white font-medium mb-4 flex items-center gap-2"><ShieldCheck');
const end = code.indexOf('              {/* Web & Social Profiles */}');
console.log(code.substring(start, end));
