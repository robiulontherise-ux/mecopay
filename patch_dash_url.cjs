const fs = require('fs');
let file = 'src/components/DashboardShell.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add dashboard_url to state
content = content.replace(
  "heartbeat_edge_url: ''",
  "heartbeat_edge_url: '',\n    dashboard_url: 'https://mecopay.pages.dev/dashboard'"
);

// 2. Add dashboard_url to API fetch setForwarderSettings
content = content.replace(
  "heartbeat_edge_url: cfg.heartbeat_edge_url || prev.heartbeat_edge_url",
  "heartbeat_edge_url: cfg.heartbeat_edge_url || prev.heartbeat_edge_url,\n              dashboard_url: cfg.dashboard_url || prev.dashboard_url"
);

// 3. Add dashboard_url to DB fetch setForwarderSettings
content = content.replace(
  "heartbeat_edge_url: data.heartbeat_edge_url || prev.heartbeat_edge_url",
  "heartbeat_edge_url: data.heartbeat_edge_url || prev.heartbeat_edge_url,\n            dashboard_url: data.dashboard_url || prev.dashboard_url"
);

// 4. Update the hardcoded upsert in sync logic
content = content.replace(
  "dashboard_url: 'https://mecopay.pages.dev/dashboard',",
  "dashboard_url: globalConfigRow.dashboard_url || 'https://mecopay.pages.dev/dashboard',"
);

// 5. Update upsert in handleSaveForwarderSettings
content = content.replace(
  "heartbeat_edge_url: forwarderSettings.heartbeat_edge_url,",
  "heartbeat_edge_url: forwarderSettings.heartbeat_edge_url,\n              dashboard_url: forwarderSettings.dashboard_url,"
);

// 6. Add UI input for dashboard_url
const inputHTML = `                {/* 9. Dashboard URL */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    9. Dashboard URL
                  </label>
                  <input
                    type="text"
                    value={forwarderSettings.dashboard_url}
                    onChange={(e) => setForwarderSettings({ ...forwarderSettings, dashboard_url: e.target.value })}
                    placeholder="https://mecopay.pages.dev/dashboard"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    ক্লাইন্ট ড্যাশবোর্ডের URL, যা অ্যাপে দেখানো হবে।
                  </span>
                </div>
              </div>`;

content = content.replace(
  "              </div>\n            </div>\n\n            <div className=\"pt-4 border-t border-slate-800",
  inputHTML + "\n            </div>\n\n            <div className=\"pt-4 border-t border-slate-800"
);

fs.writeFileSync(file, content);
console.log('Patched DashboardShell UI for dashboard_url');
