const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// The dummy variables might cause unused warnings or errors, but it's okay, we can just remove them.
code = code.replace(/const \[is2FAEnabled, setIs2FAEnabled\] = useState\(false\);/, '');
const dummyHandleToggle = `const handleToggle2FA = async () => {
    // In a real app, this would initiate a 2FA enrollment flow
    // For now, just toggle the boolean in metadata
    setIsSavingProfile(true);
    try {
      const newState = !is2FAEnabled;
      const { data, error } = await supabase.auth.updateUser({
        data: { two_factor_enabled: newState }
      });
      if (error) throw error;
      setIs2FAEnabled(newState);
      setProfileMessage(newState ? '2-Step Verification enabled via Google Authenticator' : '2-Step Verification disabled');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err: any) {
      setProfileMessage('Error: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };`;
  
if(code.includes(dummyHandleToggle)) {
    code = code.replace(dummyHandleToggle, '');
    fs.writeFileSync('src/components/DashboardShell.tsx', code);
    console.log("Cleaned up old 2FA code.");
} else {
    console.log("Could not find old 2FA code to clean up.");
}
