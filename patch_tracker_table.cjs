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
               <div className="overflow-x-auto bg-slate-900/50 border border-slate-800 rounded-xl">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-800/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                       <th className="p-4 font-semibold">Brand</th>
                       <th className="p-4 font-semibold">Gateway</th>
                       <th className="p-4 font-semibold">Number</th>
                       <th className="p-4 font-semibold text-right">Daily Trx</th>
                       <th className="p-4 font-semibold text-right">Daily Vol (৳)</th>
                       <th className="p-4 font-semibold text-right">Monthly Trx</th>
                       <th className="p-4 font-semibold text-right">Monthly Vol (৳)</th>
                       <th className="p-4 font-semibold text-center">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/60">
                     {gatewayNumbers.map((gw, idx) => {
                       const brandName = gw.brands?.name || 'Unknown Brand';
                       const monthlyVol = gw.monthly_volume || 0;
                       const dailyVol = gw.daily_volume || 0;
                       const monthlyCount = gw.monthly_count || 0;
                       const dailyCount = gw.daily_count || 0;
                       
                       const limit = 300000;
                       const percentage = (monthlyVol / limit) * 100;
                       const isNearLimit = percentage >= 80;
                       
                       return (
                         <tr 
                           key={idx} 
                           className={\`\${isNearLimit ? 'bg-red-500/10 animate-pulse relative' : 'hover:bg-slate-800/30 transition-colors'}\`}
                         >
                           {/* Add a subtle red left border if limit reached */}
                           {isNearLimit && (
                             <td className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></td>
                           )}
                           <td className="p-4 text-sm font-medium text-slate-300">
                             <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{brandName}</span>
                           </td>
                           <td className="p-4 text-sm font-bold text-blue-400 uppercase tracking-wider">
                             {gw.provider}
                           </td>
                           <td className="p-4 text-sm font-medium text-white">
                             {gw.number}
                           </td>
                           <td className="p-4 text-sm font-semibold text-slate-200 text-right">
                             {dailyCount}
                           </td>
                           <td className="p-4 text-sm font-semibold text-slate-200 text-right">
                             {dailyVol.toLocaleString()}
                           </td>
                           <td className="p-4 text-sm font-semibold text-slate-200 text-right">
                             {monthlyCount}
                           </td>
                           <td className={\`p-4 text-sm font-bold text-right \${isNearLimit ? 'text-red-400' : 'text-emerald-400'}\`}>
                             {monthlyVol.toLocaleString()}
                           </td>
                           <td className="p-4 text-center">
                             <div className="flex flex-col items-center gap-1.5 w-full max-w-[100px] mx-auto">
                               <div className="w-full bg-slate-800 rounded-full h-1.5">
                                 <div className={\`h-1.5 rounded-full \${isNearLimit ? 'bg-red-500' : 'bg-emerald-500'}\`} style={{ width: \`\${Math.min(percentage, 100)}%\` }}></div>
                               </div>
                               <span className="text-[10px] text-slate-500 font-medium">{percentage.toFixed(1)}%</span>
                             </div>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             )}
           </div>

           <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/DashboardShell.tsx', content);
  console.log("Patched Gateway UI Table");
} else {
  console.log("Regex didn't match Table patch");
}
