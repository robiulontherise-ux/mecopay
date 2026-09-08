const fs = require('fs');

function patchFile(file) {
  let data = fs.readFileSync(file, 'utf-8');
  
  const searchStr = `<div className="bg-[#1a2234] border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table`;
  
  const replaceStr = `<div className="bg-[#1a2234] border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-280px)] min-h-[400px] w-full">
          <div className="overflow-auto flex-1 relative">
            <table`;
            
  if (data.includes(searchStr)) {
    data = data.replace(searchStr, replaceStr);
    
    // Also we need to close the extra div? No, we replaced 2 opening divs with 2 opening divs! So closing divs remain identical (`</div></div>`).
  } else {
    // maybe spaces are different
    data = data.replace(/<div className="bg-\[#1a2234\] border border-slate-800 rounded-xl overflow-hidden">\s*<div className="overflow-x-auto">\s*<table/g, replaceStr);
  }
  
  fs.writeFileSync(file, data);
}

patchFile('src/components/payment-hub/PaymentLinks.tsx');
patchFile('src/components/payment-hub/GatewaySettings.tsx');
