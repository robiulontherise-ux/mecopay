const fs = require('fs');

function patchFile(file, matchStr, replaceStr) {
  if (!fs.existsSync(file)) return;
  let data = fs.readFileSync(file, 'utf-8');
  data = data.replace(matchStr, replaceStr);
  fs.writeFileSync(file, data);
}

// Invoices
patchFile(
  'src/components/payment-hub/Invoices.tsx',
  /className="bg-slate-900\/40 border border-slate-800 rounded-xl flex flex-col h-\[[^\]]+\] sm:h-\[[^\]]+\] md:h-\[[^\]]+\] w-full"/,
  'className="bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-280px)] min-h-[400px] w-full"'
);

// PaymentLinks
patchFile(
  'src/components/payment-hub/PaymentLinks.tsx',
  /<div className="overflow-x-auto">\s*<table/g,
  '<div className="bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-250px)] min-h-[400px] w-full">\n<div className="overflow-auto flex-1 relative">\n            <table'
);
patchFile(
  'src/components/payment-hub/PaymentLinks.tsx',
  /<\/table>\s*<\/div>\s*<\/div>\s*<p/g,
  '</table>\n</div>\n</div>\n</div>\n      <p'
);

// GatewaySettings
patchFile(
  'src/components/payment-hub/GatewaySettings.tsx',
  /<div className="overflow-x-auto">\s*<table/g,
  '<div className="bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-250px)] min-h-[400px] w-full">\n<div className="overflow-auto flex-1 relative">\n              <table'
);
// we might need a more precise replace for closing tags in GatewaySettings and PaymentLinks.
