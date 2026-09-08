const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// 1. Replace the gateway summary logic (top text)
const summaryLogicRegex = /<h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">[\s\S]*?<\/h2>/;

const newSummaryLogic = `<h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
               Gateway Tracker (Volume & Count)
               {(() => {
                 let nearLimitCount = 0;
                 let crossedCount = 0;
                 let needsThirdNumber = 0;
                 
                 const limitsObj = {
                    bkash: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 },
                    nagad: { dailyCount: 50, dailyAmt: 50000, monthlyCount: 100, monthlyAmt: 300000 },
                    upay: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 1000, monthlyAmt: 300000 },
                    rocket: { dailyCount: 99999, dailyAmt: 50000, monthlyCount: 999999, monthlyAmt: 300000 }
                 };

                 gatewayNumbers.forEach((gw: any) => {
                   const isPersonal = gw.type === 'personal' || !gw.type;
                   const provider = (gw.provider || '').toLowerCase();
                   const defaultLimits = { dailyCount: 100, dailyAmt: 30000, monthlyCount: 100, monthlyAmt: 300000 };
                   const lim = isPersonal ? (limitsObj[provider as keyof typeof limitsObj] || defaultLimits) : { dailyCount: 999999, dailyAmt: 9999999, monthlyCount: 999999, monthlyAmt: 9999999 };
                   
                   const pDC = (Number(gw.daily_count) || 0) / lim.dailyCount;
                   const pDA = (Number(gw.daily_amount) || 0) / lim.dailyAmt;
                   const pMC = (Number(gw.monthly_count) || 0) / lim.monthlyCount;
                   const pMA = (Number(gw.monthly_volume) || 0) / lim.monthlyAmt;
                   
                   const isCrossed = pDC >= 1 || pDA >= 1 || pMC >= 1 || pMA >= 1;
                   const isNear = !isCrossed && (pDC >= 0.8 || pDA >= 0.8 || pMC >= 0.8 || pMA >= 0.8);
                   
                   if (isCrossed) {
                     crossedCount++;
                     if (!gw.additional_numbers || gw.additional_numbers.length === 0) {
                        needsThirdNumber++;
                     }
                   } else if (isNear) {
                     nearLimitCount++;
                   }
                 });

                 if (crossedCount === 0 && nearLimitCount === 0) return null;

                 return (
                   <span className="text-xs font-bold text-yellow-400 animate-pulse bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20 flex flex-col sm:flex-row items-center gap-1.5">
                     ⚠️ {crossedCount > 0 ? \`\${crossedCount} method(s) routed to secondary.\` : ''} {nearLimitCount > 0 ? \`\${nearLimitCount} method(s) at 80% limit.\` : ''} {needsThirdNumber > 0 ? 'Please add a 3rd number!' : 'Ensure secondary/3rd numbers are online.'}
                   </span>
                 );
               })()}
             </h2>`;

content = content.replace(summaryLogicRegex, newSummaryLogic);

// 2. Replace the table rows limits logic
const tableLimitsRegex = /\/\/ Limits based on personal MFS standard vs Merchant \(unlimited\/higher\)[\s\S]*?const percMonthlyAmount = \(monthlyVol \/ limitMonthlyAmount\) \* 100;/;

const newTableLimits = `// Dynamic Limits based on Provider (Personal MFS)
                             const limitsObj = {
                                bkash: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 },
                                nagad: { dailyCount: 50, dailyAmt: 50000, monthlyCount: 100, monthlyAmt: 300000 },
                                upay: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 1000, monthlyAmt: 300000 },
                                rocket: { dailyCount: 99999, dailyAmt: 50000, monthlyCount: 999999, monthlyAmt: 300000 }
                             };
                             const providerKey = (gw.provider || '').toLowerCase();
                             const defaultLimits = { dailyCount: 100, dailyAmt: 30000, monthlyCount: 100, monthlyAmt: 300000 };
                             const providerLimits = limitsObj[providerKey as keyof typeof limitsObj] || defaultLimits;

                             const limitDailyCount = isPersonal ? providerLimits.dailyCount : 999999;
                             const limitDailyAmount = isPersonal ? providerLimits.dailyAmt : 9999999;
                             const limitMonthlyCount = isPersonal ? providerLimits.monthlyCount : 999999;
                             const limitMonthlyAmount = isPersonal ? providerLimits.monthlyAmt : 9999999;
                             
                             const percDailyCount = (dailyCount / limitDailyCount) * 100;
                             const percDailyAmount = (dailyVol / limitDailyAmount) * 100;
                             const percMonthlyCount = (monthlyCount / limitMonthlyCount) * 100;
                             const percMonthlyAmount = (monthlyVol / limitMonthlyAmount) * 100;`;

content = content.replace(tableLimitsRegex, newTableLimits);

// 3. Replace the JSX showing the limits
// We need to replace things like {isPersonal ? '100' : '∞'} with the dynamic ones.
const rowJSXRegex = /<td className=\{\`p-4 text-sm font-semibold text-right \$\{percDailyCount >= 80 \? 'text-red-400' : 'text-slate-200'\}\`\}>[\s\S]*?<\/td>\s*<td className=\{\`p-4 text-sm font-semibold text-right \$\{percMonthlyAmount >= 80 \? 'text-red-400' : 'text-slate-200'\}\`\}>[\s\S]*?<\/td>/;

const newRowJSX = `<td className={\`p-4 text-sm font-semibold text-right \${percDailyCount >= 80 ? 'text-red-400' : 'text-slate-200'}\`}>
                                   {dailyCount} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? (limitDailyCount === 99999 ? '∞' : limitDailyCount) : '∞'}</span>
                                 </td>
                                 <td className={\`p-4 text-sm font-semibold text-right \${percDailyAmount >= 80 ? 'text-red-400' : 'text-slate-200'}\`}>
                                   {dailyVol.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? (limitDailyAmount/1000 + 'k') : '∞'}</span>
                                 </td>
                                 <td className={\`p-4 text-sm font-semibold text-right \${percMonthlyCount >= 80 ? 'text-red-400' : 'text-slate-200'}\`}>
                                   {monthlyCount} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? (limitMonthlyCount === 999999 ? '∞' : limitMonthlyCount) : '∞'}</span>
                                 </td>
                                 <td className={\`p-4 text-sm font-semibold text-right \${percMonthlyAmount >= 80 ? 'text-red-400' : 'text-slate-200'}\`}>
                                   {monthlyVol.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? (limitMonthlyAmount/100000 + 'L') : '∞'}</span>
                                 </td>`;

content = content.replace(rowJSXRegex, newRowJSX);

// 4. Update the table headers which currently have static titles
// title="Limit: 100", title="Limit: 30,000", etc.
content = content.replace(/title="Limit: 100"/g, '');
content = content.replace(/title="Limit: 30,000"/g, '');
content = content.replace(/title="Limit: 300,000"/g, '');

fs.writeFileSync('src/components/DashboardShell.tsx', content);
console.log("Patched limits");
