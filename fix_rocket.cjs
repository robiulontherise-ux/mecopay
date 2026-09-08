const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/rocket: \{ dailyCount: 99999, dailyAmt: 50000, monthlyCount: 999999, monthlyAmt: 300000 \}/g, 'rocket: { dailyCount: 50, dailyAmt: 50000, monthlyCount: 100, monthlyAmt: 300000 }');
  
  // Remove the infinity ternary in DashboardShell if we are fixing it
  if (filePath.includes('DashboardShell')) {
    content = content.replace(/limitDailyCount === 99999 \? '∞' : limitDailyCount/g, 'limitDailyCount');
    content = content.replace(/limitMonthlyCount === 999999 \? '∞' : limitMonthlyCount/g, 'limitMonthlyCount');
  }
  
  fs.writeFileSync(filePath, content);
}

fixFile('src/components/checkout/CheckoutPage.tsx');
fixFile('src/components/DashboardShell.tsx');
console.log("Fixed rocket limits.");
