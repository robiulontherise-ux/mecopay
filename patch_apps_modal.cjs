const fs = require('fs');
let file = 'src/components/DashboardShell.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states for Modals inside DashboardShell
const stateOldStr = `  const [hmacSecret, setHmacSecret] = useState<string>('');
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [customDevices, setCustomDevices] = useState<string[]>([]);`;

const stateNewStr = `  const [hmacSecret, setHmacSecret] = useState<string>('');
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [customDevices, setCustomDevices] = useState<string[]>([]);
  
  // Custom Modal States
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateInput, setRegenerateInput] = useState('');
  
  const [showDeleteDeviceModal, setShowDeleteDeviceModal] = useState(false);
  const [deleteDeviceInput, setDeleteDeviceInput] = useState('');
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);`;

content = content.replace(stateOldStr, stateNewStr);

// 2. Modify handleRegenerateHmac
const regenOldStr = `  const handleRegenerateHmac = async () => {
    const confirmation = window.prompt("Are you sure? apner hmac secret abr mecopay sms forwarder sync app a abr bosate hobe ar heartbeat url o ok. Please type 'regenerate' to confirm:");
    if (confirmation === 'regenerate') {
      try {
        const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0')).join('');
        const { error } = await supabase.from('profiles').update({ hmac_secret: newSecret }).eq('id', user.id);
        
        if (error) {
          // Fallback to user_id just in case
          await supabase.from('profiles').update({ hmac_secret: newSecret }).eq('user_id', user.id);
        }
        setHmacSecret(newSecret);
        showToast("Regenerated successfully!", 'success');
      } catch (err) {
        console.error(err);
        showToast("Failed to regenerate!", 'error');
      }
    }
  };`;

const regenNewStr = `  const handleRegenerateHmac = () => {
    setShowRegenerateModal(true);
    setRegenerateInput('');
  };

  const confirmRegenerateHmac = async () => {
    if (regenerateInput !== 'regenerate') return;
    try {
      const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      const { error } = await supabase.from('profiles').update({ hmac_secret: newSecret }).eq('id', user.id);
      
      if (error) {
        await supabase.from('profiles').update({ hmac_secret: newSecret }).eq('user_id', user.id);
      }
      setHmacSecret(newSecret);
      showToast("Regenerated successfully!", 'success');
      setShowRegenerateModal(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to regenerate!", 'error');
    }
  };`;

content = content.replace(regenOldStr, regenNewStr);

// 3. Modify handleDeleteDevice
const deleteDeviceOldStr = `  const handleDeleteDevice = async (device: string) => {
    const confirmation = window.prompt(\`To delete device "\${device}", please type 'delete' or 'ডিলিট':\`);
    if (confirmation === 'delete' || confirmation === 'ডিলিট') {
      try {
        if (user?.id) {
          await supabase.from('device_status').delete().match({ user_id: user.id, device_id: device });
        }
        setCustomDevices(prev => prev.filter(d => d !== device));
      } catch (error) {
        console.error("Failed to delete device", error);
      }
    }
  };`;

const deleteDeviceNewStr = `  const handleDeleteDevice = (device: string) => {
    setDeviceToDelete(device);
    setDeleteDeviceInput('');
    setShowDeleteDeviceModal(true);
  };

  const confirmDeleteDevice = async () => {
    if (deleteDeviceInput !== 'delete' || !deviceToDelete) return;
    try {
      if (user?.id) {
        await supabase.from('device_status').delete().match({ user_id: user.id, device_id: deviceToDelete });
      }
      setCustomDevices(prev => prev.filter(d => d !== deviceToDelete));
      setShowDeleteDeviceModal(false);
      setDeviceToDelete(null);
      showToast("Device deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete device", error);
      showToast("Failed to delete device", "error");
    }
  };`;

content = content.replace(deleteDeviceOldStr, deleteDeviceNewStr);

// 4. Add the Modals JSX at the end of the DashboardShell component just before the final </div>
const modalStr = `
      {/* Regenerate HMAC Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2">Regenerate HMAC Secret</h3>
              <p className="text-slate-400 text-sm">
                Are you sure? You will need to update your MecoPay SMS Forwarder app and any Heartbeat URLs with the new secret.
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Type <span className="text-amber-500 font-bold">regenerate</span> to confirm:
              </label>
              <input
                type="text"
                value={regenerateInput}
                onChange={(e) => setRegenerateInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-amber-500 transition-colors"
                placeholder="regenerate"
              />
            </div>
            <div className="p-6 bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowRegenerateModal(false)}
                className="px-5 py-2.5 rounded-lg text-slate-300 font-bold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={regenerateInput !== 'regenerate'}
                onClick={confirmRegenerateHmac}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Device Modal */}
      {showDeleteDeviceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2">Delete Device</h3>
              <p className="text-slate-400 text-sm">
                You are about to delete device <strong>{deviceToDelete}</strong>.
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Type <span className="text-rose-400 font-bold">delete</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteDeviceInput}
                onChange={(e) => setDeleteDeviceInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-rose-500 transition-colors"
                placeholder="delete"
              />
            </div>
            <div className="p-6 bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDeviceModal(false)}
                className="px-5 py-2.5 rounded-lg text-slate-300 font-bold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteDeviceInput !== 'delete'}
                onClick={confirmDeleteDevice}
                className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
`;

const rootDivCloseStr = `      {showAppOverlay && (`;
content = content.replace(rootDivCloseStr, modalStr + rootDivCloseStr);

fs.writeFileSync(file, content);
