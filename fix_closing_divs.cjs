const fs = require('fs');

function patchClosingDivs(file) {
  let data = fs.readFileSync(file, 'utf-8');
  
  // For PaymentLinks and GatewaySettings, we replaced 2 divs with 1 div in `fix_outer.cjs`.
  // Wait, let's look at `fix_outer.cjs` again.
  // It replaced `<div className="bg-[#1a2234] border border-slate-800 rounded-xl overflow-hidden">\s*<div className="bg-slate-900/40...` 
  // with `<div className="bg-slate-900/40...`
  // So yes, 1 opening div was removed. We need to remove 1 closing div after `</table>`.
  
  data = data.replace(
    /<\/table>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/g,
    '</table>\n</div>\n</div>'
  );
  
  fs.writeFileSync(file, data);
}

patchClosingDivs('src/components/payment-hub/PaymentLinks.tsx');
patchClosingDivs('src/components/payment-hub/GatewaySettings.tsx');
