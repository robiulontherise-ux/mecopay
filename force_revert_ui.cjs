const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');

const regex = /<div>\s*<div className="flex justify-between items-center mb-1">\s*<label className="block text-sm font-medium text-slate-300">Platform Links \(Delivery\)<\/label>[\s\S]*?<p className="text-xs text-slate-500 mt-1">Configure the delivery links for this brand\. You can select which one to deliver when creating a payment link\.<\/p>\s*<\/div>\s*<\/div>/m;

const newUI = `                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-300">Platform Links (Allow Delivery Options)</label>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex gap-2 items-center">
                        <input type="checkbox" id="allow_telegram" checked={brandForm.allow_telegram} onChange={(e) => setBrandForm({...brandForm, allow_telegram: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                        <label htmlFor="allow_telegram" className="text-sm text-slate-300 flex items-center gap-2">
                          Telegram <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">t.me</span>
                        </label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="checkbox" id="allow_tally" checked={brandForm.allow_tally} onChange={(e) => setBrandForm({...brandForm, allow_tally: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                        <label htmlFor="allow_tally" className="text-sm text-slate-300 flex items-center gap-2">
                          Tally Forms <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">tally.so</span>
                        </label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="checkbox" id="allow_facebook" checked={brandForm.allow_facebook} onChange={(e) => setBrandForm({...brandForm, allow_facebook: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                        <label htmlFor="allow_facebook" className="text-sm text-slate-300 flex items-center gap-2">
                          Facebook <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">facebook.com</span>
                        </label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="checkbox" id="allow_drive" checked={brandForm.allow_drive} onChange={(e) => setBrandForm({...brandForm, allow_drive: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                        <label htmlFor="allow_drive" className="text-sm text-slate-300 flex items-center gap-2">
                          Google Drive <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">drive.google.com</span>
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Select the platforms you want to allow for payment links under this brand.</p>
                    </div>
                  </div>`;

if(content.match(regex)) {
  content = content.replace(regex, newUI);
  fs.writeFileSync('src/components/DashboardShell.tsx', content);
  console.log("Patched UI forcefully");
} else {
  console.log("Regex failed. Checking text.");
}
