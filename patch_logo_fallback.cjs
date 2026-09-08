const fs = require('fs');
const file = '/app/applet/src/mysite/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// The issue is likely that legacyData is missing the client_id field which makes the DB reject it on update, or settingsData is getting overridden incorrectly. Let's fix the fallback logic to merge or ensure it works.
code = code.replace(
  /let \{ data: settingsData, error: settingsErr \} = await supabase\s*\.from\('site_settings'\)\.select\('\*'\)\s*\.eq\('id', 'default'\)\s*\.eq\('client_id', user\.id\)\s*\.maybeSingle\(\);/,
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
          .maybeSingle(); // Just grab the default row regardless of client_id for now to restore the logo
        
        if (legacyData) {
          settingsData = legacyData;
        }
      }`
);

fs.writeFileSync(file, code);
