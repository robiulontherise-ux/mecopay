const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update limits to exact 1 Lakh and 10 Lakh
  content = content.replace(/rocket: \{ dailyCount: 99999, dailyAmt: 50000, monthlyCount: 999999, monthlyAmt: 300000 \}/g, 'rocket: { dailyCount: 100000, dailyAmt: 50000, monthlyCount: 1000000, monthlyAmt: 300000 }');
  
  if (filePath.includes('DashboardShell')) {
    // Replace the infinity ternary with a proper L (Lakh) or local string formatter
    content = content.replace(/\{isPersonal \? \(limitDailyCount === 99999 \? '∞' : limitDailyCount\) : '∞'\}/g, "{isPersonal ? (limitDailyCount >= 100000 ? (limitDailyCount/100000 + 'L') : limitDailyCount.toLocaleString()) : '∞'}");
    content = content.replace(/\{isPersonal \? \(limitMonthlyCount === 999999 \? '∞' : limitMonthlyCount\) : '∞'\}/g, "{isPersonal ? (limitMonthlyCount >= 100000 ? (limitMonthlyCount/100000 + 'L') : limitMonthlyCount.toLocaleString()) : '∞'}");
  }
  
  fs.writeFileSync(filePath, content);
}

fixFile('src/components/checkout/CheckoutPage.tsx');
fixFile('src/components/DashboardShell.tsx');
console.log("Updated to exact Lakh limits.");
