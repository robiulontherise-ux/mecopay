const fs = require('fs');
let code = fs.readFileSync('src/components/MfaSettings.tsx', 'utf-8');

const oldHeader = `      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-white font-medium">2-Step Verification (TOTP)</h3>
          {!is2FAEnabled && (
            <p className="text-xs text-slate-400 mt-1">Add an extra layer of security using Google Authenticator</p>
          )}
          {is2FAEnabled && (
            <p className="text-xs text-emerald-400 font-medium mt-1">✓ Your account is protected with 2-Step Verification</p>
          )}
        </div>
      </div>`;

const newHeader = `      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-white font-medium">2-Step Verification (TOTP)</h3>
          {!is2FAEnabled ? (
            <p className="text-xs text-slate-400 mt-1">Add an extra layer of security using Google Authenticator.</p>
          ) : (
            <div className="mt-1">
              <p className="text-sm text-emerald-400 font-bold mb-1">✓ 2-Step Verification is Active</p>
              <p className="text-xs text-slate-400">Your account is highly secure. To turn off 2-Step Verification, click the disable button below.</p>
            </div>
          )}
        </div>
      </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/MfaSettings.tsx', code);
console.log('Fixed MFA header description part 2');
