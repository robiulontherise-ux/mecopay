const fs = require('fs');
let code = fs.readFileSync('src/components/MfaSettings.tsx', 'utf-8');

// Add state for secret
if (!code.includes('const [secret, setSecret] = useState')) {
  code = code.replace(
    "const [qrCode, setQrCode] = useState<string | null>(null);",
    "const [qrCode, setQrCode] = useState<string | null>(null);\n  const [secret, setSecret] = useState<string | null>(null);"
  );
}

// Set secret on enroll
code = code.replace(
  "setQrCode(data.totp.qr_code); // SVG string",
  "setQrCode(data.totp.qr_code);\n      setSecret(data.totp.secret);"
);

// Clear secret on verify
code = code.replace(
  "setQrCode(null);",
  "setQrCode(null);\n      setSecret(null);"
);

// Add Secret UI
const qrCodeUI = `{qrCode && (
              <div className="bg-white p-4 rounded-lg inline-block mx-auto">
                <div dangerouslySetInnerHTML={{ __html: qrCode }} className="w-40 h-40" />
              </div>
            )}`;

const newUI = `{qrCode && (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg inline-block mx-auto">
                  <div dangerouslySetInnerHTML={{ __html: qrCode }} className="w-40 h-40" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs text-slate-500 mb-2">Or enter this setup key manually:</p>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800 justify-center">
                    <code className="text-sm font-mono text-emerald-400">{secret}</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(secret || '')}
                      className="text-slate-500 hover:text-white transition-colors"
                      title="Copy Key"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}`;

code = code.replace(qrCodeUI, newUI);
fs.writeFileSync('src/components/MfaSettings.tsx', code);
console.log('Added manual entry code for MFA');
