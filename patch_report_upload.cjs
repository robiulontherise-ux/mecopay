const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

const oldReportForm = `<textarea 
                  required
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none resize-none h-32 mb-6 font-medium text-slate-800 transition-all"
                  placeholder="Explain what happened..."
                />`;

const newReportForm = `<textarea 
                  required
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none resize-none h-32 mb-4 font-medium text-slate-800 transition-all"
                  placeholder="Explain what happened..."
                />
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Attach Screenshot (Proof)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                      </div>
                      <span className="text-sm font-medium text-slate-600">Click to upload screenshot</span>
                      <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                    </div>
                  </div>
                </div>`;

content = content.replace(oldReportForm, newReportForm);

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched report form");
