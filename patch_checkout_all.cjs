const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

// 1. Remove min-h-[650px]
content = content.replace(/min-h-\[650px\]/g, '');

// 2. Nagad colors update
content = content.replace(/bg-\[#ED1C24\]/g, 'bg-[#B31A1B]');
content = content.replace(/text-\[#ED1C24\]/g, 'text-[#B31A1B]');

// 3. Update Nagad Header for Copy Buttons (Total Amount & Invoice)
const nagadHeaderOld = `{providerKey === 'nagad' && (
                <div className="border border-white/30 rounded-lg p-4 flex justify-between items-center mb-2">
                  <div>
                    <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Total Amount:</div>
                    <div className="text-2xl font-bold">BDT {linkData?.price}</div>
                  </div>
                  <button className="bg-white text-red-600 p-2 rounded-full"><Copy className="w-4 h-4" /></button>
                </div>
              )}`;

const nagadHeaderNew = `{providerKey === 'nagad' && (
                <div className="border border-white/30 rounded-lg p-4 flex justify-between items-center mb-2">
                  <div>
                    <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Total Amount:</div>
                    <div className="text-2xl font-bold">BDT {linkData?.price}</div>
                  </div>
                  <button onClick={() => copyToClipboard(linkData?.price?.toString() || '', 'amount')} className="bg-white text-[#B31A1B] p-2.5 rounded-full transition-transform hover:scale-105">
                    {copied === 'amount' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}`;

content = content.replace(nagadHeaderOld, nagadHeaderNew);

const nagadInvoiceOld = `{providerKey === 'nagad' && (
                    <p className="text-xs opacity-80 flex items-center gap-1 mt-1 font-mono">Invoice No: {invoiceId.substring(0, 15)}...</p>
                  )}`;
const nagadInvoiceNew = `{providerKey === 'nagad' && (
                    <p className="text-xs opacity-80 flex items-center gap-2 mt-1 font-mono">Invoice No: {invoiceId.substring(0, 15)}... 
                      <button onClick={() => copyToClipboard(invoiceId, 'invoice')} className="hover:text-white transition-colors">
                        {copied === 'invoice' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </p>
                  )}`;

content = content.replace(nagadInvoiceOld, nagadInvoiceNew);

const bkashInvoiceOld = `{providerKey === 'bkash' && (
                    <p className="text-xs opacity-60 flex items-center gap-1 mt-1">Inv No: {invoiceId || 'b51bfea0...'} <Copy className="w-3 h-3" /></p>
                  )}`;
const bkashInvoiceNew = `{providerKey === 'bkash' && (
                    <p className="text-xs opacity-60 flex items-center gap-2 mt-1">Inv No: {invoiceId || 'b51bfea0...'} 
                      <button onClick={() => copyToClipboard(invoiceId, 'invoice')} className="hover:text-slate-800 transition-colors">
                        {copied === 'invoice' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </p>
                  )}`;
content = content.replace(bkashInvoiceOld, bkashInvoiceNew);

// 4. Update Step 4/5 Copy Buttons
content = content.replace(/<span className="text-emerald-600 font-bold text-xs">Copied<\/span>/g, '<CheckCircle2 className="w-5 h-5 text-emerald-600" />');
content = content.replace(/<span className="text-emerald-400 font-bold text-sm">Copied<\/span>/g, '<CheckCircle2 className="w-5 h-5 text-emerald-500" />');

// Find onClick={() => copyToClipboard(selectedGateway.number)} and ensure id 'number'
// Actually let's just make sure it's using the check icon
content = content.replace(/copied \? <CheckCircle2 className="w-5 h-5 text-emerald-[0-9]+" \/>/g, "copied === 'number' ? <CheckCircle2 className=\"w-5 h-5 text-emerald-600\" />");

// In Step 5, it's currently using navigator.clipboard.writeText directly for Upay/Nagad, let's fix that
const step5UpayCopyOld = `onClick={() => navigator.clipboard.writeText(selectedGateway.number)}`;
const step5UpayCopyNew = `onClick={() => copyToClipboard(selectedGateway.number, 'number')}`;
content = content.replace(step5UpayCopyOld, step5UpayCopyNew);
content = content.replace(step5UpayCopyOld, step5UpayCopyNew); // for the second occurrence

// For step 5 Upay copy icon replacement:
const upayStep5IconOld = `<Copy className="w-4 h-4" />`;
const upayStep5IconNew = `{copied === 'number' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}`;
// This is risky if there are multiple. Let's do it carefully with regex on the exact line.
content = content.replace(/<button onClick=\{\(\) => copyToClipboard\(selectedGateway\.number, 'number'\)\} className="bg-white p-2.5 rounded-full shadow-sm text-\[#0033A0\] transition-transform hover:scale-105"><Copy className="w-4 h-4" \/><\/button>/g,
`<button onClick={() => copyToClipboard(selectedGateway.number, 'number')} className="bg-white p-2.5 rounded-full shadow-sm text-[#0033A0] transition-transform hover:scale-105">{copied === 'number' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}</button>`);

content = content.replace(/<button onClick=\{\(\) => copyToClipboard\(selectedGateway\.number, 'number'\)\} className="bg-white\/20 p-2.5 rounded-full hover:bg-white\/30 transition-colors">\s*<Copy className="w-4 h-4" \/>\s*<\/button>/g,
`<button onClick={() => copyToClipboard(selectedGateway.number, 'number')} className="bg-white/20 p-2.5 rounded-full hover:bg-white/30 transition-colors">
                             {copied === 'number' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                           </button>`);

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched all copy buttons!");
