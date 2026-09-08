const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const usersCode = `
    if (activeSubMenu === 'Users') {
      return (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Registered Clients</h2>
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              <RefreshCw className="w-4 h-4" /> Sync Auth Users
            </button>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="p-4 text-sm font-bold text-slate-300">Client Info</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Auth Provider</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Verification</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Joined</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Status</th>
                    <th className="p-4 text-sm font-bold text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Mock Data for visual demonstration of admin capability */}
                  <tr className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">R</div>
                        <div>
                          <p className="text-sm font-bold text-white">Robiul Islam</p>
                          <p className="text-xs text-slate-400">robiulontherise@gmail.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                        <Globe className="w-3 h-3 text-blue-400" /> Google Auth
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> Verified (NID)
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">Today</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-xs font-medium text-blue-400 border border-blue-500/20">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">T</div>
                        <div>
                          <p className="text-sm font-bold text-white">Test User</p>
                          <p className="text-xs text-slate-400">test@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                        <Globe className="w-3 h-3 text-blue-400" /> Google Auth
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-xs font-medium text-amber-400 border border-amber-500/20">
                        <ShieldAlert className="w-3 h-3" /> Pending
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">Yesterday</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-xs font-medium text-red-400 border border-red-500/20">
                        Blocked
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
`;

const splitText = `    // Default placeholder
    return (`;

code = code.replace(splitText, usersCode + '\n' + splitText);
fs.writeFileSync('src/components/DashboardShell.tsx', code);
