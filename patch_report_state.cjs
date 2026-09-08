const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

// 1. Add state for the file
if (!content.includes('const [reportProof, setReportProof]')) {
  content = content.replace(
    /const \[reportReason, setReportReason\] = useState\(''\);/,
    `const [reportReason, setReportReason] = useState('');\n  const [reportProof, setReportProof] = useState<File | null>(null);`
  );
}

// 2. Update the file input to handle changes and show the selected file
const fileInputUI = `<div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                      </div>
                      <span className="text-sm font-medium text-slate-600">Click to upload screenshot</span>
                      <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                    </div>
                  </div>`;

const newFileInputUI = `<div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setReportProof(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="flex flex-col items-center relative z-0">
                      {reportProof ? (
                        <>
                           <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                             <CheckCircle2 className="w-5 h-5" />
                           </div>
                           <span className="text-sm font-bold text-emerald-600">{reportProof.name}</span>
                           <span className="text-xs text-slate-500 mt-1">Tap to change file</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                          </div>
                          <span className="text-sm font-medium text-slate-600">Click to upload screenshot</span>
                          <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                        </>
                      )}
                    </div>
                  </div>`;

content = content.replace(fileInputUI, newFileInputUI);

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched report file state");
