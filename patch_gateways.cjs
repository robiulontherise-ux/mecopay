const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const targetStr = `               </div>
             )}
           </div>

           <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>`;

const replacement = `               </div>
             )}
           </div>

           <div className="mb-8">
             <h2 className="text-2xl font-bold text-white mb-4">Gateway Volume Tracker</h2>
             {gatewayNumbers.length === 0 ? (
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-slate-400 text-sm">
                 No gateways configured yet.
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {gatewayNumbers.map((gw, idx) => {
                   const brandName = gw.brands?.name || 'Unknown Brand';
                   const monthlyVol = gw.monthly_volume || 0;
                   const limit = 300000;
                   const percentage = (monthlyVol / limit) * 100;
                   const isNearLimit = percentage >= 80;
                   return (
                     <div key={idx} className={\`bg-slate-900/50 border \${isNearLimit ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-slate-800'} rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden\`}>
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{gw.provider}</span>
                             <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{brandName}</span>
                           </div>
                           <p className="text-white font-medium text-sm">{gw.number}</p>
                         </div>
                         <div className={\`text-right \${isNearLimit ? 'animate-pulse scale-105 origin-right transition-transform' : ''}\`}>
                           <p className={\`text-sm font-bold \${isNearLimit ? 'text-red-400' : 'text-emerald-400'}\`}>৳ {monthlyVol.toLocaleString()}</p>
                           <p className="text-[10px] text-slate-500">/ 300,000 limit</p>
                         </div>
                       </div>
                       <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1">
                         <div className={\`h-1.5 rounded-full \${isNearLimit ? 'bg-red-500' : 'bg-emerald-500'}\`} style={{ width: \`\${Math.min(percentage, 100)}%\` }}></div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </div>

           <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync('src/components/DashboardShell.tsx', content);
  console.log("Patched Gateway UI");
} else {
  console.log("String didn't match");
}
