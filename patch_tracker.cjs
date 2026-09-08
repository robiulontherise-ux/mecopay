const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const replacement = `                             // If ANY of the 4 metrics hits >= 80%, trigger the alert
                             const isNearLimit = percDailyCount >= 80 || percDailyAmount >= 80 || percMonthlyCount >= 80 || percMonthlyAmount >= 80;
                             const isCrossed = percDailyCount >= 100 || percDailyAmount >= 100 || percMonthlyCount >= 100 || percMonthlyAmount >= 100;
                             const maxPerc = Math.max(percDailyCount, percDailyAmount, percMonthlyCount, percMonthlyAmount);

                             return (
                               <tr 
                                 key={idx} 
                                 className={\`\${isNearLimit && !isCrossed ? 'bg-red-500/10 animate-pulse relative' : 'hover:bg-slate-800/30 transition-colors'}\`}
                               >
                                 {isNearLimit && !isCrossed && (
                                   <td className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></td>
                                 )}
                                 <td className="p-4 text-sm font-bold text-blue-400 uppercase tracking-wider flex flex-col gap-1">
                                   {gw.provider}
                                   {!isPersonal && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded w-max">MERCHANT</span>}
                                 </td>
                                 <td className="p-4 text-sm font-medium">
                                   <div className="flex flex-col gap-2">
                                     <div className="flex items-center gap-2">
                                       <span className={\`\${isCrossed ? 'text-slate-500 line-through' : 'text-white'}\`}>{gw.number}</span>
                                       {!isCrossed ? (
                                         <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">✅ ACTIVE</span>
                                       ) : (
                                         <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/30">LIMIT REACHED</span>
                                       )}
                                     </div>
                                     {gw.number_2 && (
                                       <div className="flex items-center gap-2">
                                         <span className={\`\${isCrossed ? 'text-white' : 'text-slate-600'}\`}>{gw.number_2}</span>
                                         {isCrossed ? (
                                           <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">✅ ACTIVE</span>
                                         ) : (
                                           <span className="text-[9px] font-bold bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-700">STANDBY</span>
                                         )}
                                       </div>
                                     )}
                                   </div>
                                 </td>`;

const regex = /\s*\/\/\s*If ANY of the 4 metrics hits >= 80%, trigger the alert[\s\S]*?<td className="p-4 text-sm font-medium text-white">\s*\{gw\.number\}\s*<\/td>/;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/DashboardShell.tsx', content);
  console.log("Patched correctly.");
} else {
  console.log("Regex didn't match!");
}
