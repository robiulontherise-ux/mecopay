const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// 1. Add json_payload_template to useState
const stateOld = `
  const [forwarderSettings, setForwarderSettings] = useState({
    sender_number: '',
    text_filter: '',
    webhook_edge_url: '',
    headers: '',
    project_url: '',
    anon_key: '',
    ws_channel: '',
    heartbeat_edge_url: ''
  });
`;
const stateNew = `
  const [forwarderSettings, setForwarderSettings] = useState({
    sender_number: '',
    text_filter: '',
    webhook_edge_url: '',
    headers: '',
    json_payload_template: '',
    project_url: '',
    anon_key: '',
    ws_channel: '',
    heartbeat_edge_url: ''
  });
`;
content = content.replace(stateOld.trim(), stateNew.trim());

// 2. Add json_payload_template to fetch results
const fetchOld = `
            headers: cfg.headers || prev.headers,
            project_url: cfg.project_url || prev.project_url,
`;
const fetchNew = `
            headers: cfg.headers || prev.headers,
            json_payload_template: cfg.json_payload_template || prev.json_payload_template,
            project_url: cfg.project_url || prev.project_url,
`;
content = content.replace(fetchOld.trim(), fetchNew.trim());

const supabaseFetchOld = `
            headers: data.headers || prev.headers,
            project_url: data.project_url || prev.project_url,
`;
const supabaseFetchNew = `
            headers: data.headers || prev.headers,
            json_payload_template: data.json_payload_template || prev.json_payload_template,
            project_url: data.project_url || prev.project_url,
`;
content = content.replace(supabaseFetchOld.trim(), supabaseFetchNew.trim());

// 3. Add to upsert in handleSaveForwarderSettings
const upsertOld = `
              headers: forwarderSettings.headers,
              project_url: forwarderSettings.project_url,
`;
const upsertNew = `
              headers: forwarderSettings.headers,
              json_payload_template: forwarderSettings.json_payload_template,
              project_url: forwarderSettings.project_url,
`;
content = content.replace(upsertOld.trim(), upsertNew.trim());

// 4. Add UI field. It should be right after headers.
const uiOld = `
              {/* 4. Headers */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  4. Headers (JSON Box)
                </label>
                <textarea
                  rows={3}
                  value={forwarderSettings.headers}
                  onChange={(e) => setForwarderSettings({ ...forwarderSettings, headers: e.target.value })}
                  placeholder={'{\\n  "Content-Type": "application/json"\\n}'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  অ্যাপ থেকে ফরোয়ার্ড করা রিকোয়েস্টে যে হেডারগুলো পাঠানো হবে।
                </span>
              </div>

              <div className="border-t border-slate-800/80 pt-4 mt-4">
                <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3">
                  Heartbeat WebSocket URL উপাদানসমূহ (Auto Composed by SQL)
                </h4>
`;

const uiNew = `
              {/* 4. Headers */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  4. Headers (JSON Box)
                </label>
                <textarea
                  rows={3}
                  value={forwarderSettings.headers}
                  onChange={(e) => setForwarderSettings({ ...forwarderSettings, headers: e.target.value })}
                  placeholder={'{\\n  "Content-Type": "application/json"\\n}'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  অ্যাপ থেকে ফরোয়ার্ড করা রিকোয়েস্টে যে হেডারগুলো পাঠানো হবে।
                </span>
              </div>

              {/* 4.5 Json Payload Template */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Json Payload Template
                </label>
                <textarea
                  rows={3}
                  value={forwarderSettings.json_payload_template || ''}
                  onChange={(e) => setForwarderSettings({ ...forwarderSettings, json_payload_template: e.target.value })}
                  placeholder={'{\\n  "sender": "{sender}",\\n  "message": "{message}"\\n}'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  এসএমএস ফরোয়ার্ডার অ্যাপ থেকে পাঠানো JSON পে-লোডের স্ট্রাকচার।
                </span>
              </div>

              <div className="border-t border-slate-800/80 pt-4 mt-4">
                <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3">
                  Heartbeat WebSocket URL উপাদানসমূহ (Auto Composed by SQL)
                </h4>
`;

content = content.replace(uiOld.trim(), uiNew.trim());

fs.writeFileSync('src/components/DashboardShell.tsx', content, 'utf-8');
console.log('DashboardShell.tsx patched');
