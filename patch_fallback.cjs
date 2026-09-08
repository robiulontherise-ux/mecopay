const fs = require('fs');
const file = '/app/applet/src/mysite/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the settingsData fetching logic
code = code.replace(
  /const { data: settingsData, error: settingsErr } = await supabase\s*\.from\('site_settings'\)\.select\('\*'\)\.eq\('client_id', user\.id\)\s*\.eq\('id', 'default'\)\s*\.maybeSingle\(\);/,
  `let { data: settingsData, error: settingsErr } = await supabase
        .from('site_settings').select('*')
        .eq('id', 'default')
        .eq('client_id', user.id)
        .maybeSingle();
        
      if (!settingsData) {
        // Fallback to legacy global settings if no client-specific settings found
        const { data: legacyData } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'default')
          .is('client_id', null)
          .maybeSingle();
        
        if (legacyData) {
          settingsData = legacyData;
        }
      }`
);

// We should also let legacy categories and posts be visible temporarily, or just settings? The user only complained about the logo. Let's do settings first to see if that fixes their main visual concern.
fs.writeFileSync(file, code);
