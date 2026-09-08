const fs = require('fs');
let code = fs.readFileSync('src/components/MfaSettings.tsx', 'utf-8');

code = code.replace(
  '<p className="text-sm text-slate-300">\n              1. Scan this QR code with Google Authenticator or any TOTP app.\n            </p>',
  '<p className="text-sm text-slate-300">\n              1. Scan this QR code with Google Authenticator, OR copy the manual setup key.\n            </p>'
);

fs.writeFileSync('src/components/MfaSettings.tsx', code);
