const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const summaryLogicRegex = /<h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">[\s\S]*?<\/h2>/;

const newSummaryLogic = `<h2 className="text-2xl font-bold text-white mb-4 flex flex-wrap items-center gap-3">
               Gateway Tracker (Volume & Count)
               {(() => {
                 let warnings: string[] = [];

                 gatewayNumbers.forEach((gw: any) => {
                   const isPersonal = gw.type === 'personal' || !gw.type;
                   if (!isPersonal) return;

                   const providerName = (gw.provider || 'Gateway').toUpperCase();
                   const limitsObj = {
                      bkash: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 },
                      nagad: { dailyCount: 50, dailyAmt: 50000, monthlyCount: 100, monthlyAmt: 300000 },
                      upay: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 1000, monthlyAmt: 300000 },
                      rocket: { dailyCount: 100000, dailyAmt: 50000, monthlyCount: 1000000, monthlyAmt: 300000 }
                   };
                   const providerKey = (gw.provider || '').toLowerCase();
                   const defaultLimits = { dailyCount: 100, dailyAmt: 30000, monthlyCount: 100, monthlyAmt: 300000 };
                   const lim = limitsObj[providerKey as keyof typeof limitsObj] || defaultLimits;
                   
                   const pDC = (Number(gw.daily_count) || 0) / lim.dailyCount;
                   const pDA = (Number(gw.daily_amount) || 0) / lim.dailyAmt;
                   const pMC = (Number(gw.monthly_count) || 0) / lim.monthlyCount;
                   const pMA = (Number(gw.monthly_volume) || 0) / lim.monthlyAmt;
                   
                   const maxPerc = Math.max(pDC, pDA, pMC, pMA);
                   const hasNumber2 = !!gw.number_2;
                   const hasNumber3 = gw.additional_numbers && gw.additional_numbers.length > 0;
                   
                   const currentLevel = Math.floor(maxPerc);
                   const percInLevel = maxPerc - currentLevel;

                   if (currentLevel === 0) {
                     if (percInLevel >= 0.8) {
                       if (!hasNumber2) warnings.push(\`\${providerName} at \${(percInLevel * 100).toFixed(0)}%. Please add a 2nd Number!\`);
                       else warnings.push(\`\${providerName} at \${(percInLevel * 100).toFixed(0)}%. Ensure 2nd Number is online.\`);
                     }
                   } else if (currentLevel === 1) {
                     if (!hasNumber2) {
                       warnings.push(\`\${providerName} Limit Reached (100%). Please add a 2nd Number immediately!\`);
                     } else {
                       if (percInLevel >= 0.8) {
                         if (!hasNumber3) warnings.push(\`\${providerName} 2nd NM at \${(percInLevel * 100).toFixed(0)}%. Please add a 3rd Number!\`);
                         else warnings.push(\`\${providerName} 2nd NM at \${(percInLevel * 100).toFixed(0)}%. Ensure 3rd Number is online.\`);
                       } else if (percInLevel === 0 && maxPerc === 1) {
                         // exactly 100% and has a 2nd number
                         warnings.push(\`\${providerName} routed to 2nd Number. Ensure it is online.\`);
                       } else {
                         warnings.push(\`\${providerName} routed to 2nd Number.\`);
                       }
                     }
                   } else {
                     if (!hasNumber2) {
                       warnings.push(\`\${providerName} Limit Reached! Please add a 2nd Number immediately!\`);
                     } else if (!hasNumber3) {
                       warnings.push(\`\${providerName} 2nd Limit Reached! Please add a 3rd Number immediately!\`);
                     } else {
                       if (percInLevel >= 0.8) warnings.push(\`\${providerName} 3rd NM at \${(percInLevel * 100).toFixed(0)}%.\`);
                       else warnings.push(\`\${providerName} routed to 3rd Number.\`);
                     }
                   }
                 });

                 if (warnings.length === 0) return null;

                 return (
                   <div className="flex flex-col gap-2 w-full mt-2">
                     {warnings.map((msg, i) => (
                       <span key={i} className="text-xs font-bold text-yellow-400 animate-pulse bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20 flex items-center gap-1.5 w-fit">
                         ⚠️ {msg}
                       </span>
                     ))}
                   </div>
                 );
               })()}
             </h2>`;

content = content.replace(summaryLogicRegex, newSummaryLogic);
fs.writeFileSync('src/components/DashboardShell.tsx', content);
console.log("Patched summary logic.");
