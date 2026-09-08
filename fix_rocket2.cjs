const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  // Revert back to what user actually provided
  content = content.replace(/rocket: \{ dailyCount: 50, dailyAmt: 50000, monthlyCount: 100, monthlyAmt: 300000 \}/g, 'rocket: { dailyCount: 99999, dailyAmt: 50000, monthlyCount: 999999, monthlyAmt: 300000 }');
  
  // Make sure we have the infinity formatting correct in DashboardShell
  if (filePath.includes('DashboardShell')) {
    // We previously removed the ternary in our "fix", let's put it back properly
    content = content.replace(/\{isPersonal \? \(limitDailyCount\) : '∞'\}/g, "{isPersonal ? (limitDailyCount === 99999 ? '∞' : limitDailyCount) : '∞'}");
    content = content.replace(/\{isPersonal \? \(limitMonthlyCount\) : '∞'\}/g, "{isPersonal ? (limitMonthlyCount === 999999 ? '∞' : limitMonthlyCount) : '∞'}");
    
    // Also cover the case where we just removed it completely:
    content = content.replace(/\{isPersonal \? limitDailyCount : '∞'\}/g, "{isPersonal ? (limitDailyCount === 99999 ? '∞' : limitDailyCount) : '∞'}");
    content = content.replace(/\{isPersonal \? limitMonthlyCount : '∞'\}/g, "{isPersonal ? (limitMonthlyCount === 999999 ? '∞' : limitMonthlyCount) : '∞'}");
  }
  
  fs.writeFileSync(filePath, content);
}

fixFile('src/components/checkout/CheckoutPage.tsx');
fixFile('src/components/DashboardShell.tsx');
console.log("Reverted rocket limits.");
