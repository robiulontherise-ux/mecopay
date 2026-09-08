const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// Insert currentLevel inside the map function
content = content.replace(
  /const maxPerc = Math\.max\(percDailyCount, percDailyAmount, percMonthlyCount, percMonthlyAmount\);/,
  `const maxPerc = Math.max(percDailyCount, percDailyAmount, percMonthlyCount, percMonthlyAmount);
                             const currentLevel = Math.floor(maxPerc / 100);`
);

fs.writeFileSync('src/components/DashboardShell.tsx', content);
console.log("Fixed currentLevel declaration.");
