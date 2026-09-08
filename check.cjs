const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');
console.log(code.includes("const [ageGroup, setAgeGroup]"));
