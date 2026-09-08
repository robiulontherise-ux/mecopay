const fs = require('fs');

function patchOuter(file) {
  let data = fs.readFileSync(file, 'utf-8');
  
  data = data.replace(
    /<div className="bg-\[#1a2234\] border border-slate-800 rounded-xl overflow-hidden">\s*<div className="bg-slate-900\/40/g,
    '<div className="bg-slate-900/40'
  );
  
  // also need to remove the closing </div> for the removed wrapper.
  // wait, earlier I replaced `</table>\n</div>\n</div>\n</div>\n      <p` ... let's see what the bottom of the file looks like.
  
  fs.writeFileSync(file, data);
}

patchOuter('src/components/payment-hub/PaymentLinks.tsx');
patchOuter('src/components/payment-hub/GatewaySettings.tsx');
