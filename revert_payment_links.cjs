const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/PaymentLinks.tsx', 'utf-8');

const regex = /<div>\s*<label className="block text-sm text-slate-300 mb-1">Amount Type<\/label>[\s\S]*?<input type="number" value=\{feeAmount\} onChange=\{e => setFeeAmount\(e\.target\.value\)\} className="w-1\/2 bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2\.5 focus:border-blue-500 focus:outline-none" placeholder="0\.00" \/>\s*<\/div>\s*<\/div>/;

const replacement = `<div>
                  <label className="block text-sm text-slate-300 mb-1">Price (BDT) *</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                </div>
              </div>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/payment-hub/PaymentLinks.tsx', content);
  console.log("Reverted PaymentLinks UI");
} else {
  console.log("Regex didn't match PaymentLinks for reverting!");
}
