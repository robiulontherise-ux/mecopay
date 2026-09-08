const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const replacement = `
  // Admin Users Real State
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [mockAdminUsers, setMockAdminUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setMockAdminUsers(data.users || []);
      } else {
        const err = await res.json();
        console.error("Failed to fetch users:", err.error);
        alert("Could not load users. Is the backend running with the Service Role key?");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeSubMenu === 'Users' && isAdmin) {
      fetchUsers();
    }
  }, [activeSubMenu, isAdmin]);
  
  const toggleUserStatus = async (id: string, currentStatus: string) => {
    const isBlocking = currentStatus === 'Active';
    try {
      const res = await fetch(\`/api/admin/users/\${id}/\${isBlocking ? 'block' : 'unblock'}\`, {
        method: 'POST'
      });
      if (res.ok) {
        setMockAdminUsers(users => users.map(u => 
          u.id === id ? { ...u, status: isBlocking ? 'Blocked' : 'Active' } : u
        ));
      } else {
        const err = await res.json();
        alert("Error changing status: " + err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };
`;

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

code = code.replace(mockUsersState.trim(), replacement.trim());

const usersTableReplace = `
                        {client.status === 'Active' ? (
                          <button 
                            onClick={() => { if(confirm('Are you sure you want to block this user? They will lose access to all features.')) toggleUserStatus(client.id, client.status) }}
                            className="bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Block
                          </button>
                        ) : (
                          <button 
                            onClick={() => { if(confirm('Are you sure you want to unblock this user?')) toggleUserStatus(client.id, client.status) }}
                            className="bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Unblock
                          </button>
                        )}
`;

const oldUsersTable = `
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
`;

code = code.replace(oldUsersTable, usersTableReplace);

const oldFooter = `
            <div className="p-4 border-t border-slate-800 bg-slate-900 text-center">
              <p className="text-xs text-slate-500">Search by Client ID or Email to quickly find a user who has been reported for fraud or rule violations.</p>
            </div>
`;
const newFooter = `
            <div className="p-4 border-t border-slate-800 bg-slate-900 text-center flex justify-between items-center">
              <p className="text-xs text-slate-500">Search by Client ID or Email to quickly find a user who has been reported for fraud or rule violations.</p>
              <p className="text-xs text-slate-500">{mockAdminUsers.length} total clients.</p>
            </div>
`;
code = code.replace(oldFooter, newFooter);

const syncBtnOld = `<RefreshCw className="w-4 h-4" /> Sync`;
const syncBtnNew = `<RefreshCw className={\`w-4 h-4 \${isLoadingUsers ? 'animate-spin' : ''}\`} /> {isLoadingUsers ? 'Syncing...' : 'Sync'}`;
code = code.replace(syncBtnOld, syncBtnNew);

const syncClickOld = `
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm shrink-0">
`;
const syncClickNew = `
              <button onClick={fetchUsers} disabled={isLoadingUsers} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm shrink-0 disabled:opacity-50">
`;
code = code.replace(syncClickOld, syncClickNew);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
