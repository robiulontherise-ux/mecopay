const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf-8');

// 1. Add deviceName state
content = content.replace(
  "const [secondaryAccountNumber, setSecondaryAccountNumber] = useState('');",
  "const [secondaryAccountNumber, setSecondaryAccountNumber] = useState('');\n  const [deviceName, setDeviceName] = useState('');\n  const [availableDevices, setAvailableDevices] = useState<any[]>([]);"
);

// 2. Fetch devices
content = content.replace(
  "const fetchGateways = async () => {",
  `const fetchGateways = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: devices } = await supabase.from('device_status').select('device_id, device_name').eq('user_id', user.id);
        if (devices) setAvailableDevices(devices);
      }
    } catch (e) {}`
);

// 3. Update payload
content = content.replace(
  "provider: provider\n        };",
  "provider: provider,\n          device_name: deviceName\n        };"
);

// 4. Update edit click
content = content.replace(
  "setSecondaryAccountNumber(gw.number_2 || '');",
  "setSecondaryAccountNumber(gw.number_2 || '');\n                              setDeviceName(gw.device_name || '');"
);

// 5. Update UI
const uiAddition = `
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-blue-400 font-medium mb-4">Device Assignment</h4>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1 flex items-center gap-1">
                      <span className="text-blue-400">📱</span> Select App Device
                    </label>
                    <select
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Any Device / None</option>
                      {availableDevices.map(d => (
                        <option key={d.device_id} value={d.device_name}>{d.device_name} ({d.device_id})</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Assign this gateway to a specific phone running the MecoPay app to monitor its online/offline status correctly.</p>
                  </div>
                </div>
`;

content = content.replace(
  /<div className="pt-4 border-t border-slate-800">\s*<h4 className="text-blue-400 font-medium mb-4">Limits & Fees<\/h4>/,
  uiAddition + '\n                <div className="pt-4 border-t border-slate-800">\n                  <h4 className="text-blue-400 font-medium mb-4">Limits & Fees</h4>'
);

fs.writeFileSync('src/components/payment-hub/GatewaySettings.tsx', content);
