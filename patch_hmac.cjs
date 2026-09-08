const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const generateHmacFunc = `
  const handleRegenerateHmac = async () => {
    const confirmation = window.prompt("Are you sure? apner hmac secret abr mecopay sms forwarder sync app a abr bosate hobe ar heartbeat url o ok. Please type 'regenerate' to confirm:");
    if (confirmation === 'regenerate') {
      try {
        const newSecret = 'sk_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        const { error } = await supabase.from('profiles').update({ hmac_secret: newSecret }).eq('id', user.id);
        if (error) {
          // Fallback to user_id
          await supabase.from('profiles').update({ hmac_secret: newSecret }).eq('user_id', user.id);
        }
        setHmacSecret(newSecret);
        alert("HMAC Secret Regenerated successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to regenerate HMAC Secret");
      }
    }
  };
`;

// Insert the function before handleLogout
content = content.replace("const handleLogout = async () => {", generateHmacFunc + "\n  const handleLogout = async () => {");

// Add the Regenerate button next to HMAC Secret
content = content.replace(
  '<label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">HMAC Secret (Box)</label>',
  '<div className="flex justify-between items-center mb-1.5"><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">HMAC Secret (Box)</label><button onClick={handleRegenerateHmac} className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"><RefreshCw className="w-3 h-3" /> Regenerate</button></div>'
);

fs.writeFileSync('src/components/DashboardShell.tsx', content);
console.log("Patched HMAC");
