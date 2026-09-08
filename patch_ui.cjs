const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const oldContent = `
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5"><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">HMAC Secret (Box)</label>
`;

const newContent = `
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">JSON Payload Template</label>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 group">
                  <pre className="text-slate-200 font-mono text-sm overflow-x-auto m-0 whitespace-pre-wrap">
                    {forwarderSettings.json_payload_template || ""}
                  </pre>
                  <button onClick={() => handleCopy(forwarderSettings.json_payload_template || "", "payload")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors shrink-0 flex items-center gap-1.5">
                    {copiedField === 'payload' ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-bold">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span className="text-xs font-medium">Copy</span></>}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5"><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">HMAC Secret (Box)</label>
`;

content = content.replace(oldContent.trim(), newContent.trim());
fs.writeFileSync('src/components/DashboardShell.tsx', content, 'utf-8');
console.log('UI patched');
