const fs = require('fs');
const file = '/app/applet/src/mysite/App.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldLogic = `// 2. Strict production query (Matches exact domain from URL)
      // Note: If testing locally, you can force a domain like: currentDomain = "mybrand.com";
      const { data: settingsData, error: settingsErr } = await supabase
        .from('site_settings')
        .select('*')
        .eq('domain', currentDomain)
        .limit(1)
        .maybeSingle();`;

const newLogic = `// 2. Strict production query (Checks both Custom Domain and Subdomain)
      // Note: If testing locally, you can force a domain like: currentDomain = "mybrand.com";
      const { data: settingsData, error: settingsErr } = await supabase
        .from('site_settings')
        .select('*')
        .or(\`domain.eq.\${currentDomain},subdomain.eq.\${currentDomain}\`)
        .limit(1)
        .maybeSingle();`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync(file, code);
