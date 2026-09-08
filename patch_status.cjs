const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// Replace the number rendering logic in the table
const numberRenderRegex = /<div className="flex flex-col gap-1">[\s\S]*?<\/div>\s*<\/td>/;

const newNumberRender = `<div className="flex flex-col gap-1">
                                     <div className="flex items-center gap-2">
                                       <span className={\`\${currentLevel === 0 ? 'text-white' : 'text-slate-500 line-through'}\`}>{gw.number}</span>
                                       {currentLevel === 0 ? (
                                         <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">✅ ACTIVE</span>
                                       ) : (
                                         <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/30">LIMIT REACHED</span>
                                       )}
                                     </div>
                                     {gw.number_2 && (
                                       <div className="flex items-center gap-2">
                                         <span className={\`\${currentLevel === 1 ? 'text-white' : (currentLevel > 1 ? 'text-slate-500 line-through' : 'text-slate-600')}\`}>{gw.number_2}</span>
                                         {currentLevel === 1 ? (
                                           <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">✅ ACTIVE</span>
                                         ) : currentLevel > 1 ? (
                                           <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/30">LIMIT REACHED</span>
                                         ) : (
                                           <span className="text-[9px] font-bold bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-700">STANDBY</span>
                                         )}
                                       </div>
                                     )}
                                     {gw.additional_numbers && gw.additional_numbers.length > 0 && gw.additional_numbers.map((addNum: string, addIdx: number) => {
                                       const levelForThisNum = 2 + addIdx;
                                       return (
                                         <div key={addIdx} className="flex items-center gap-2">
                                           <span className={\`\${currentLevel === levelForThisNum ? 'text-white' : (currentLevel > levelForThisNum ? 'text-slate-500 line-through' : 'text-slate-600')}\`}>{addNum}</span>
                                           {currentLevel === levelForThisNum ? (
                                             <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">✅ ACTIVE</span>
                                           ) : currentLevel > levelForThisNum ? (
                                             <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/30">LIMIT REACHED</span>
                                           ) : (
                                             <span className="text-[9px] font-bold bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-700">STANDBY</span>
                                           )}
                                         </div>
                                       );
                                     })}
                                   </div>
                                 </td>`;

content = content.replace(numberRenderRegex, newNumberRender);
fs.writeFileSync('src/components/DashboardShell.tsx', content);
console.log("Patched number render.");
