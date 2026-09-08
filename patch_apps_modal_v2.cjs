const fs = require('fs');
let file = 'src/components/DashboardShell.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states for Modals inside DashboardShell
const stateOldStr = `  const [customDevices, setCustomDevices] = useState<string[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<any[]>([]);`;

const stateNewStr = `  const [customDevices, setCustomDevices] = useState<string[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<any[]>([]);

  // Custom Modal States
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateInput, setRegenerateInput] = useState('');
  
  const [showDeleteDeviceModal, setShowDeleteDeviceModal] = useState(false);
  const [deleteDeviceInput, setDeleteDeviceInput] = useState('');
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);`;

if(content.includes(stateOldStr)) {
    content = content.replace(stateOldStr, stateNewStr);
} else {
    console.log("Could not find state string");
}

// 2. Modify handleRegenerateHmac
const regenOldStr = `  const handleRegenerateHmac = async () => {
    const confirmation = window.prompt("Are you sure? apner hmac secret abr mecopay sms forwarder sync app a abr bosate hobe ar heartbeat url o ok. Please type 'regenerate' to confirm:");
    if (confirmation === 'regenerate') {
      try {
        const newSecret = 'sk_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        const { error } = await supabase.from('profiles').update({ hmac_secret: newSecret }).eq('id', user.id);
        
        if (error) {
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
      const newSecret = 'sk_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
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

if(content.includes(regenOldStr)) {
    content = content.replace(regenOldStr, regenNewStr);
} else {
    console.log("Could not find regenerate string");
}

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

if(content.includes(deleteDeviceOldStr)) {
    content = content.replace(deleteDeviceOldStr, deleteDeviceNewStr);
} else {
    console.log("Could not find delete device string");
}

// 4. Modify handleAddDevice
const addDeviceOldStr = `  const handleAddDevice = async () => {
    if (!newDeviceInput.trim()) {
      alert("Please enter a device name");
      return;
    }
    const newDevice = newDeviceInput.trim();
    if (customDevices.includes(newDevice)) {
      alert("Device already exists");
      return;
    }
    
    try {
      // Optimistically add to list
      setCustomDevices([...customDevices, newDevice]);
      setNewDeviceInput('');
      
      // Upsert into device_status for the current user
      if (user?.id) {
        await supabase.from('device_status').upsert({
          user_id: user.id,
          device_id: newDevice,
          connected: false,
          last_heartbeat_at: new Date().toISOString()
        }, { onConflict: 'user_id,device_id' });
      }
    } catch (err) {
      console.error("Failed to add device", err);
      // Revert if error
      setCustomDevices(customDevices.filter(d => d !== newDevice));
    }
  };`;

const addDeviceNewStr = `  const handleAddDevice = async () => {
    if (!newDeviceInput.trim()) {
      showToast("Please enter a device name", "error");
      return;
    }
    const newDevice = newDeviceInput.trim();
    if (customDevices.includes(newDevice)) {
      showToast("Device already exists", "error");
      return;
    }
    
    try {
      // Upsert into device_status for the current user
      if (user?.id) {
        const { error } = await supabase.from('device_status').upsert({
          user_id: user.id,
          device_id: newDevice,
          connected: false,
          last_heartbeat_at: new Date().toISOString()
        }, { onConflict: 'user_id,device_id' });
        
        if (error) throw error;
      }
      
      // Update list and show success
      setCustomDevices([...customDevices, newDevice]);
      setNewDeviceInput('');
      showToast("Device created successfully!", "success");
    } catch (err) {
      console.error("Failed to add device", err);
      showToast("Failed to create device", "error");
    }
  };`;

if(content.includes(addDeviceOldStr)) {
    content = content.replace(addDeviceOldStr, addDeviceNewStr);
} else {
    console.log("Could not find add device string");
}


// 5. Add the Modals JSX at the end of the DashboardShell component just before the final </div>
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
if(content.includes(rootDivCloseStr)) {
    if(!content.includes("Regenerate HMAC Modal")) {
        content = content.replace(rootDivCloseStr, modalStr + rootDivCloseStr);
    }
} else {
    console.log("Could not find overlay string");
}

fs.writeFileSync(file, content);
