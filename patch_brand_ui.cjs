const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');

const oldBlock = `                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-300">Redirect Links</label>
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
                        <input type="checkbox" id="allow_whatsapp" checked={brandForm.allow_whatsapp} onChange={(e) => setBrandForm({...brandForm, allow_whatsapp: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                        <label htmlFor="allow_whatsapp" className="text-sm text-slate-300 flex items-center gap-2">
                          WhatsApp <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">wa.me</span>
                        </label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="checkbox" id="allow_drive" checked={brandForm.allow_drive} onChange={(e) => setBrandForm({...brandForm, allow_drive: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                        <label htmlFor="allow_drive" className="text-sm text-slate-300 flex items-center gap-2">
                          Google Drive & Forms <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">drive.google.com, docs.google.com</span>
                        </label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="checkbox" id="allow_youtube" checked={brandForm.allow_youtube} onChange={(e) => setBrandForm({...brandForm, allow_youtube: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                        <label htmlFor="allow_youtube" className="text-sm text-slate-300 flex items-center gap-2">
                          YouTube <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">youtube.com</span>
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Select the platforms you want to allow for payment links under this brand.</p>
                    </div>
                  </div>`;

const newBlock = `                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-300">Platform Links (Delivery)</label>
                    </div>
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm text-slate-300 flex items-center gap-2">
                          Telegram Group <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-slate-400 font-mono">t.me/</span>
                        </label>
                        <input type="text" value={brandForm.telegram_link} onChange={(e) => setBrandForm({...brandForm, telegram_link: e.target.value})} placeholder="https://t.me/yourgroup" className="w-full bg-[#1a2234] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm text-slate-300 flex items-center gap-2">
                          Facebook Group <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-slate-400 font-mono">facebook.com/</span>
                        </label>
                        <input type="text" value={brandForm.facebook_link} onChange={(e) => setBrandForm({...brandForm, facebook_link: e.target.value})} placeholder="https://facebook.com/groups/yourgroup" className="w-full bg-[#1a2234] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm text-slate-300 flex items-center gap-2">
                          Tally Form <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-slate-400 font-mono">tally.so/</span>
                        </label>
                        <input type="text" value={brandForm.tally_link} onChange={(e) => setBrandForm({...brandForm, tally_link: e.target.value})} placeholder="https://tally.so/r/yourform" className="w-full bg-[#1a2234] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm text-slate-300 flex items-center gap-2">
                          Google Drive <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-slate-400 font-mono">drive.google.com</span>
                        </label>
                        <input type="text" value={brandForm.drive_link} onChange={(e) => setBrandForm({...brandForm, drive_link: e.target.value})} placeholder="https://drive.google.com/drive/folders/..." className="w-full bg-[#1a2234] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Configure the delivery links for this brand. You can select which one to deliver when creating a payment link.</p>
                    </div>
                  </div>`;

if(content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  console.log("Patched UI successfully.");
} else {
  console.log("Could not find the UI block. Let's try matching with regex.");
  const uiRegex = /<div>\s*<div className="flex justify-between items-center mb-1">\s*<label className="block text-sm font-medium text-slate-300">Redirect Links<\/label>[\s\S]*?<p className="text-xs text-slate-500 mt-1">Select the platforms you want to allow for payment links under this brand\.<\/p>\s*<\/div>\s*<\/div>/;
  if(content.match(uiRegex)) {
    content = content.replace(uiRegex, newBlock);
    console.log("Patched UI via regex successfully.");
  } else {
    console.log("Still failed.");
  }
}

fs.writeFileSync('src/components/DashboardShell.tsx', content);
