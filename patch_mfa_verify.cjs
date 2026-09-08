const fs = require('fs');
let code = fs.readFileSync('src/components/MfaVerification.tsx', 'utf-8');
if (!code.includes('refreshSession')) {
  code = code.replace(
    "const { data, error } = await supabase.auth.mfa.listFactors();",
    "await supabase.auth.refreshSession();\n        const { data, error } = await supabase.auth.mfa.listFactors();"
  );
  fs.writeFileSync('src/components/MfaVerification.tsx', code);
  console.log('Patched MfaVerification.tsx');
}
