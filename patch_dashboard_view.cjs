const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const regex = /if \(activeSubMenu === 'Dashboard' \|\| activeSubMenu === 'Analytics'\) \{[\s\S]*?return \([\s\S]*?\)[\s\S]*?\}/;

const replacement = `if (activeSubMenu === 'Analytics') {
       return (
         <div className="max-w-4xl">
           <h2 className="text-2xl font-bold text-white mb-6">Payments Analytics</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
               <p className="text-sm text-slate-400 font-medium mb-2">Today's Volume</p>
               <p className="text-3xl font-bold text-white">৳ 0</p>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
               <p className="text-sm text-slate-400 font-medium mb-2">Pending Invoices</p>
               <p className="text-3xl font-bold text-white">0</p>
             </div>
          </div>
         </div>
       )
    }

    if (activeSubMenu === 'Dashboard') {
       return (
         <div className="max-w-4xl">
           <div className="mb-8">
             <h2 className="text-2xl font-bold text-white mb-4">Device Status ({deviceStatuses.length} Added)</h2>
             {deviceStatuses.length === 0 ? (
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-slate-400 text-sm">
                 No devices added yet. Go to Plugins & Apps to connect your device.
               </div>
             ) : (
               <div className="flex flex-col gap-3">
                 {deviceStatuses.map((dev, idx) => {
                   const isConnected = dev.connected || (dev.last_heartbeat_at && new Date().getTime() - new Date(dev.last_heartbeat_at).getTime() < 120000);
                   return (
                     <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-800 rounded-lg">
                           <Smartphone className="w-5 h-5 text-slate-300" />
                         </div>
                         <div>
                           <p className="text-white font-medium">{dev.device_id}</p>
                           <p className="text-xs text-slate-400">ID: {dev.device_id}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className={\`w-2.5 h-2.5 rounded-full \${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500'}\`}></span>
                         <span className={\`text-sm font-medium \${isConnected ? 'text-emerald-500' : 'text-red-500'}\`}>
                           {isConnected ? 'Connected' : 'Disconnected'}
                         </span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </div>

           <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
               <p className="text-sm text-slate-400 font-medium mb-2">Today's Volume</p>
               <p className="text-3xl font-bold text-white">৳ 0</p>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
               <p className="text-sm text-slate-400 font-medium mb-2">Pending Invoices</p>
               <p className="text-3xl font-bold text-white">0</p>
             </div>
          </div>
         </div>
       )
    }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/DashboardShell.tsx', content);
  console.log("Patched successfully!");
} else {
  console.log("Regex didn't match.");
}
