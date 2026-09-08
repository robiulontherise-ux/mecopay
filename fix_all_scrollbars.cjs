const fs = require('fs');

function patchFile(file) {
  let data = fs.readFileSync(file, 'utf-8');
  
  // Find `<div className="bg-[#1a2234] border border-slate-800 rounded-xl overflow-hidden">`
  // Replace with the flex flex-col fixed height wrapper
  data = data.replace(
    /<div className="bg-\[#1a2234\] border border-slate-800 rounded-xl overflow-hidden">\s*<div className="overflow-x-auto">\s*<table/g,
    `<div className="bg-[#1a2234] border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-280px)] min-h-[400px] w-full">\n          <div className="overflow-auto flex-1 relative">\n            <table`
  );
  
  fs.writeFileSync(file, data);
}

patchFile('src/components/payment-hub/PaymentLinks.tsx');
patchFile('src/components/payment-hub/GatewaySettings.tsx');
