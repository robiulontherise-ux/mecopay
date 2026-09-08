const fs = require('fs');

// Patch DashboardRoute.tsx
let dashboardCode = fs.readFileSync('src/components/DashboardRoute.tsx', 'utf-8');
if (!dashboardCode.includes('refreshSession')) {
  dashboardCode = dashboardCode.replace(
    "const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();",
    "// Force a session refresh to get the latest MFA factors from the server (fixes cross-device sync)\n      await supabase.auth.refreshSession();\n\n      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();"
  );
  fs.writeFileSync('src/components/DashboardRoute.tsx', dashboardCode);
  console.log('Patched DashboardRoute.tsx');
}

// Patch MfaSettings.tsx
let mfaSettingsCode = fs.readFileSync('src/components/MfaSettings.tsx', 'utf-8');
if (!mfaSettingsCode.includes('refreshSession')) {
  mfaSettingsCode = mfaSettingsCode.replace(
    "const { data, error } = await supabase.auth.mfa.listFactors();",
    "await supabase.auth.refreshSession();\n      const { data, error } = await supabase.auth.mfa.listFactors();"
  );
  fs.writeFileSync('src/components/MfaSettings.tsx', mfaSettingsCode);
  console.log('Patched MfaSettings.tsx');
}

