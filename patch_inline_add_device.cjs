const fs = require('fs');
let file = 'src/components/DashboardShell.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldKeyDown = `                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newDeviceInput.trim() && !customDevices.includes(newDeviceInput.trim())) {
                        
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
                        }
                      }
                    }}`;

const newKeyDown = `                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        if (!newDeviceInput.trim()) {
                          showToast("Please enter a device name", "error");
                          return;
                        }
                        if (customDevices.includes(newDeviceInput.trim())) {
                          showToast("Device already exists", "error");
                          return;
                        }
                        
                        const newDevice = newDeviceInput.trim();
                        if (user?.id) {
                          const { error } = await supabase.from('device_status').insert({
                            user_id: user.id,
                            device_id: newDevice,
                            connected: false
                          });
                          if (error && error.code !== '23505') {
                            console.error('Failed to add device to DB', error);
                            showToast("Failed to add device", "error");
                            return;
                          }
                        }
                        setCustomDevices([...customDevices, newDevice]);
                        setNewDeviceInput('');
                        showToast("Device created successfully!", "success");
                      }
                    }}`;

content = content.replace(oldKeyDown, newKeyDown);

const oldBtnClick = `                  <button 
                    onClick={() => {
                      if (newDeviceInput.trim() && !customDevices.includes(newDeviceInput.trim())) {
                        
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
                        }
                      }
                    }}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors"
                  >`;

const newBtnClick = `                  <button 
                    onClick={async () => {
                        if (!newDeviceInput.trim()) {
                          showToast("Please enter a device name", "error");
                          return;
                        }
                        if (customDevices.includes(newDeviceInput.trim())) {
                          showToast("Device already exists", "error");
                          return;
                        }
                        
                        const newDevice = newDeviceInput.trim();
                        if (user?.id) {
                          const { error } = await supabase.from('device_status').insert({
                            user_id: user.id,
                            device_id: newDevice,
                            connected: false
                          });
                          if (error && error.code !== '23505') {
                            console.error('Failed to add device to DB', error);
                            showToast("Failed to add device", "error");
                            return;
                          }
                        }
                        setCustomDevices([...customDevices, newDevice]);
                        setNewDeviceInput('');
                        showToast("Device created successfully!", "success");
                    }}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors"
                  >`;

content = content.replace(oldBtnClick, newBtnClick);

fs.writeFileSync(file, content);
