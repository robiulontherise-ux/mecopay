const fs = require('fs');

let inv = fs.readFileSync('src/components/payment-hub/Invoices.tsx', 'utf-8');

// Replace the height calculation with a more responsive viewport-based max height
// old: className="bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-220px)]"
// new: className="bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col h-[70vh] md:h-[75vh]"
inv = inv.replace(
  /className="bg-slate-900\/40 border border-slate-800 rounded-xl flex flex-col h-\[calc\(100vh-220px\)\]"/,
  'className="bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col h-[65vh] sm:h-[70vh] md:h-[75vh] w-full"'
);

fs.writeFileSync('src/components/payment-hub/Invoices.tsx', inv);
