const fs = require('fs');
const file = '/app/applet/src/mysite/App.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldLogic = `// 1. Get the current domain the visitor is browsing from
      const currentDomain = window.location.hostname;
      
      // 2. Query settings based on the domain (Fallback to 'default' for testing in AI Studio)
      let query = supabase.from('site_settings').select('*');
      
      if (currentDomain === 'localhost' || currentDomain.includes('run.app')) {
         query = query.eq('id', 'default'); // Demo environment
      } else {
         query = query.eq('domain', currentDomain); // Custom domain environment
      }
      
      const { data: settingsData, error: settingsErr } = await query.limit(1).maybeSingle();`;

const newLogic = `// 1. Get the current domain the visitor is browsing from
      let currentDomain = window.location.hostname;
      
      // 2. Strict production query (Matches exact domain from URL)
      // Note: If testing locally, you can force a domain like: currentDomain = "mybrand.com";
      const { data: settingsData, error: settingsErr } = await supabase
        .from('site_settings')
        .select('*')
        .eq('domain', currentDomain)
        .limit(1)
        .maybeSingle();`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync(file, code);
