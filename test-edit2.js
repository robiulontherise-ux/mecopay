const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const importSearch = "Search, ";
code = code.replace("LogOut, ", "Search, LogOut, ");

const mockUsersState = `
  // Admin Users Mock State
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [mockAdminUsers, setMockAdminUsers] = useState([
    {
      id: 'USR-2024-X8F9A2B',
      name: 'Robiul Islam',
      email: 'robiulontherise@gmail.com',
      provider: 'Google Auth',
      verification: 'Verified (NID)',
      joined: 'Today',
      status: 'Active'
    },
    {
      id: 'USR-2024-T9G1C4D',
      name: 'Test User',
      email: 'test@example.com',
      provider: 'Google Auth',
      verification: 'Pending',
      joined: 'Yesterday',
      status: 'Blocked'
    }
  ]);
  
  const toggleUserStatus = (id: string) => {
    setMockAdminUsers(users => users.map(u => 
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u
    ));
  };
`;

code = code.replace("  // Profile States", mockUsersState + "\n  // Profile States");

const usersComponent = `
    if (activeSubMenu === 'Users' && isAdmin) {
      const filteredUsers = mockAdminUsers.filter(u => 
        u.id.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(adminSearchQuery.toLowerCase())
      );

      return (
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white">Registered Clients</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search by ID, Email, Name..." 
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm shrink-0">
                <RefreshCw className="w-4 h-4" /> Sync
              </button>
            </div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="p-4 text-sm font-bold text-slate-300">Client Info</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Client ID</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Auth Provider</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Verification</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Joined</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Status</th>
                    <th className="p-4 text-sm font-bold text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                        No clients found matching your search.
                      </td>
                    </tr>
                  ) : filteredUsers.map((client) => (
                    <tr key={client.id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={\`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold border shrink-0 \${client.status === 'Blocked' ? 'text-red-400 border-red-500/20' : 'text-emerald-400 border-emerald-500/20'}\`}>
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{client.name}</p>
                            <p className="text-xs text-slate-400">{client.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">{client.id}</code>
                          <button onClick={() => navigator.clipboard.writeText(client.id)} className="text-slate-500 hover:text-white" title="Copy ID">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                          <Globe className="w-3 h-3 text-blue-400" /> {client.provider}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border \${client.verification.includes('Verified') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}\`}>
                          {client.verification.includes('Verified') ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          {client.verification}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-400">{client.joined}</td>
                      <td className="p-4">
                        <span className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border \${client.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}\`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {client.status === 'Active' ? (
                          <button 
                            onClick={() => { if(confirm('Are you sure you want to block this user? They will lose access to all features.')) toggleUserStatus(client.id) }}
                            className="bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Block
                          </button>
                        ) : (
                          <button 
                            onClick={() => { if(confirm('Are you sure you want to unblock this user?')) toggleUserStatus(client.id) }}
                            className="bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Unblock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900 text-center">
              <p className="text-xs text-slate-500">Search by Client ID or Email to quickly find a user who has been reported for fraud or rule violations.</p>
            </div>
          </div>
        </div>
      );
    }
`;

const replaceRegex = /if \(activeSubMenu === 'Users' && isAdmin\) \{[\s\S]*?Note: Listing real users requires a backend integration with Supabase Auth API using a Service Role key.<\/p>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/g;

code = code.replace(replaceRegex, usersComponent.trim());

fs.writeFileSync('src/components/DashboardShell.tsx', code);
