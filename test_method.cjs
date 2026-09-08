const fs = require('fs');

let gw = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf-8');

const getMethodStr = `
                              {(() => {
                                if (gw.type !== 'personal' && gw.type) {
                                  return (gw.provider || 'API').toUpperCase();
                                }
                                const vTrx = brandObj?.redirect_links?.verify_trx_id ?? true;
                                const vPhone = brandObj?.redirect_links?.verify_phone ?? false;
                                if (vTrx && vPhone) return "10 Min Live + Manual";
                                if (vPhone) return "10 Min Live";
                                if (vTrx) return "Manual";
                                return "None";
                              })()}
`;

gw = gw.replace(
  /<td className="px-6 py-4 text-slate-400">manual<\/td>/,
  `<td className="px-6 py-4 text-slate-400">${getMethodStr}</td>`
);

fs.writeFileSync('src/components/payment-hub/GatewaySettings.tsx', gw);
