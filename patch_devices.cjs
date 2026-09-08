const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const addDeviceRegex = /setCustomDevices\(\[\.\.\.customDevices, newDeviceInput\.trim\(\)\]\);\n\s*setNewDeviceInput\(''\);/g;
const addDeviceReplacement = `
                        const newDevice = newDeviceInput.trim();
                        setCustomDevices([...customDevices, newDevice]);
                        setNewDeviceInput('');
                        if (user?.id) {
                          supabase.from('device_status').insert({
                            user_id: user.id,
                            device_id: newDevice,
                            connected: false
                          }).then(({error}) => {
                             if (error && error.code !== '23505') console.error('Failed to add device to DB', error);
                          });
                        }`;

content = content.replace(addDeviceRegex, addDeviceReplacement);
fs.writeFileSync('src/components/DashboardShell.tsx', content);
console.log("Patched device addition");
