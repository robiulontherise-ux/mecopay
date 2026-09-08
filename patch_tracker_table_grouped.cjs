const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const regex = /<div className="mb-8">\s*<h2 className="text-2xl font-bold text-white mb-4">Gateway Tracker \(Volume & Count\)<\/h2>[\s\S]*?<h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview<\/h2>/;

const replacement = `<div className="mb-8">
             <h2 className="text-2xl font-bold text-white mb-4">Gateway Tracker (Volume & Count)</h2>
             {gatewayNumbers.length === 0 ? (
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-slate-400 text-sm">
                 No gateways configured yet.
               </div>
             ) : (
               <div className="space-y-6">
                 {Object.entries(
                   gatewayNumbers.reduce((acc, gw) => {
                     const brand = gw.brands?.name || 'Unknown Brand';
                     if (!acc[brand]) acc[brand] = [];
                     acc[brand].push(gw);
                     return acc;
                   }, {})
                 ).map(([brandName, gateways]: [string, any], bIdx) => (
                   <div key={bIdx} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                     <div className="bg-slate-800/80 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                       <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                         <Globe className="w-5 h-5 text-blue-400" />
                         {brandName}
                       </h3>
                       <span className="text-xs font-medium text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700 shadow-inner">
                         {gateways.length} Gateways
                       </span>
                     </div>
                     <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                         <thead>
                           <tr className="bg-slate-900/40 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                             <th className="p-4 font-semibold w-24">Gateway</th>
                             <th className="p-4 font-semibold">Number</th>
                             <th className="p-4 font-semibold text-right" title="Limit: 100">Daily Trx</th>
                             <th className="p-4 font-semibold text-right" title="Limit: 30,000">Daily Vol (৳)</th>
                             <th className="p-4 font-semibold text-right" title="Limit: 100">Monthly Trx</th>
                             <th className="p-4 font-semibold text-right" title="Limit: 300,000">Monthly Vol (৳)</th>
                             <th className="p-4 font-semibold text-center w-28">Status</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-800/60">
                           {gateways.map((gw: any, idx: number) => {
                             const monthlyVol = Number(gw.monthly_volume) || 0;
                             const dailyVol = Number(gw.daily_amount) || 0;
                             const monthlyCount = Number(gw.monthly_count) || 0;
                             const dailyCount = Number(gw.daily_count) || 0;
                             const isPersonal = gw.type === 'personal' || !gw.type;
                             
                             // Limits based on personal MFS standard vs Merchant (unlimited/higher)
                             const limitDailyCount = isPersonal ? 100 : 999999;
                             const limitDailyAmount = isPersonal ? 30000 : 9999999;
                             const limitMonthlyCount = isPersonal ? 100 : 999999;
                             const limitMonthlyAmount = isPersonal ? 300000 : 9999999;
                             
                             const percDailyCount = (dailyCount / limitDailyCount) * 100;
                             const percDailyAmount = (dailyVol / limitDailyAmount) * 100;
                             const percMonthlyCount = (monthlyCount / limitMonthlyCount) * 100;
                             const percMonthlyAmount = (monthlyVol / limitMonthlyAmount) * 100;
                             
                             // If ANY of the 4 metrics hits >= 80%, trigger the alert
                             const isNearLimit = percDailyCount >= 80 || percDailyAmount >= 80 || percMonthlyCount >= 80 || percMonthlyAmount >= 80;
                             const maxPerc = Math.max(percDailyCount, percDailyAmount, percMonthlyCount, percMonthlyAmount);
                             
                             return (
                               <tr 
                                 key={idx} 
                                 className={\`\${isNearLimit ? 'bg-red-500/10 animate-pulse relative' : 'hover:bg-slate-800/30 transition-colors'}\`}
                               >
                                 {isNearLimit && (
                                   <td className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></td>
                                 )}
                                 <td className="p-4 text-sm font-bold text-blue-400 uppercase tracking-wider flex flex-col gap-1">
                                   {gw.provider}
                                   {!isPersonal && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded w-max">MERCHANT</span>}
                                 </td>
                                 <td className="p-4 text-sm font-medium text-white">
                                   {gw.number}
                                 </td>
                                 <td className={\`p-4 text-sm font-semibold text-right \${percDailyCount >= 80 ? 'text-red-400' : 'text-slate-200'}\`}>
                                   {dailyCount} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? '100' : '∞'}</span>
                                 </td>
                                 <td className={\`p-4 text-sm font-semibold text-right \${percDailyAmount >= 80 ? 'text-red-400' : 'text-slate-200'}\`}>
                                   {dailyVol.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? '30k' : '∞'}</span>
                                 </td>
                                 <td className={\`p-4 text-sm font-semibold text-right \${percMonthlyCount >= 80 ? 'text-red-400' : 'text-slate-200'}\`}>
                                   {monthlyCount} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? '100' : '∞'}</span>
                                 </td>
                                 <td className={\`p-4 text-sm font-semibold text-right \${percMonthlyAmount >= 80 ? 'text-red-400' : 'text-slate-200'}\`}>
                                   {monthlyVol.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? '3L' : '∞'}</span>
                                 </td>
                                 <td className="p-4 text-center">
                                   <div className="flex flex-col items-center gap-1.5 w-full">
                                     <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                       <div className={\`h-1.5 rounded-full \${isNearLimit ? 'bg-red-500' : 'bg-emerald-500'}\`} style={{ width: \`\${Math.min(maxPerc, 100)}%\` }}></div>
                                     </div>
                                     <span className={\`text-[10px] font-bold \${isNearLimit ? 'text-red-400' : 'text-slate-400'}\`}>{maxPerc.toFixed(1)}%</span>
                                   </div>
                                 </td>
                               </tr>
                             );
                           })}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>

           <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/DashboardShell.tsx', content);
  console.log("Patched Gateway UI Table Grouped");
} else {
  console.log("Regex didn't match Table patch");
}
