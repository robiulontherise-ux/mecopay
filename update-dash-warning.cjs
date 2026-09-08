const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const oldFetch = `
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
`;

const newFetch = `
  const [adminWarning, setAdminWarning] = useState('');
  
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setAdminWarning('');
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.warning) setAdminWarning(data.warning);
        setMockAdminUsers(data.users || []);
      } else {
        const err = await res.json();
        console.error("Failed to fetch users:", err.error);
        setAdminWarning("Could not load users from server.");
      }
    } catch (e) {
      console.error(e);
      setAdminWarning("Failed to connect to backend API.");
    } finally {
      setIsLoadingUsers(false);
    }
  };
`;

code = code.replace(oldFetch.trim(), newFetch.trim());

const tableHeader = `
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
`;

const newTableHeader = `
          {adminWarning && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Missing Backend Configuration</p>
                <p>{adminWarning}</p>
                <p className="mt-1 text-xs opacity-80">To see live Google Auth users and actually block them, you must add <code>SUPABASE_SERVICE_ROLE_KEY</code> in the AI Studio Secrets panel.</p>
              </div>
            </div>
          )}
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
`;

code = code.replace(tableHeader.trim(), newTableHeader.trim());

fs.writeFileSync('src/components/DashboardShell.tsx', code);
