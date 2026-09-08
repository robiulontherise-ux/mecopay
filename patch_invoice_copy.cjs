const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

// For bKash Invoice
content = content.replace(
  /<p className="text-xs opacity-60 flex items-center gap-1 mt-1">Inv No: \{invoiceId \|\| 'b51bfea0\.\.\.'\} <Copy className="w-3 h-3" \/><\/p>/g,
  `<p className="text-xs opacity-60 flex items-center gap-2 mt-1">Inv No: {invoiceId || 'b51bfea0...'} 
                      <button onClick={() => copyToClipboard(invoiceId, 'invoice')} className="hover:text-slate-800 transition-colors">
                        {copied === 'invoice' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </p>`
);

// For Nagad Invoice
content = content.replace(
  /<p className="text-xs opacity-80 flex items-center gap-1 mt-1 font-mono">Invoice No: \{invoiceId\.substring\(0, 15\)\}\.\.\.<\/p>/g,
  `<p className="text-xs opacity-80 flex items-center gap-2 mt-1 font-mono">Invoice No: {invoiceId.substring(0, 15)}... 
                      <button onClick={() => copyToClipboard(invoiceId, 'invoice')} className="hover:text-white transition-colors">
                        {copied === 'invoice' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </p>`
);

// We also need to add copy buttons for bKash amount and Upay amount in steps 4 & 5.
// bKash amount is here:
// <div className="text-xl font-bold">৳{linkData?.price}</div>
content = content.replace(
  /<div className="text-xl font-bold">৳\{linkData\?\.price\}<\/div>/g,
  `<div className="text-xl font-bold flex items-center gap-2">৳{linkData?.price}
    <button onClick={() => copyToClipboard(linkData?.price?.toString() || '', 'amount')} className="text-slate-500 hover:text-slate-800 transition-colors">
      {copied === 'amount' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
    </button>
  </div>`
);

// Upay amount is here:
// <div className="text-lg font-bold">Amount: <span className="font-black">BDT {linkData?.price}</span></div>
content = content.replace(
  /<div className="text-lg font-bold">Amount: <span className="font-black">BDT \{linkData\?\.price\}<\/span><\/div>/g,
  `<div className="text-lg font-bold flex items-center justify-center gap-2">Amount: <span className="font-black">BDT {linkData?.price}</span>
    <button onClick={() => copyToClipboard(linkData?.price?.toString() || '', 'amount')} className="text-slate-500 hover:text-[#0033A0] transition-colors">
      {copied === 'amount' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
    </button>
  </div>`
);

// We need to add the Supabase Storage upload to the report modal
// Wait, for this patch, just fix the copy buttons.
fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched invoice/amount copy");
