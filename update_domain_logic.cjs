const fs = require('fs');
const file = '/app/applet/src/mysite/App.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldSettingsFetch = `const { data: settingsData, error: settingsErr } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .limit(1)
        .maybeSingle();`;

const newSettingsFetch = `// 1. Get the current domain the visitor is browsing from
      const currentDomain = window.location.hostname;
      
      // 2. Query settings based on the domain (Fallback to 'default' for testing in AI Studio)
      let query = supabase.from('site_settings').select('*');
      
      if (currentDomain === 'localhost' || currentDomain.includes('run.app')) {
         query = query.eq('id', 'default'); // Demo environment
      } else {
         query = query.eq('domain', currentDomain); // Custom domain environment
      }
      
      const { data: settingsData, error: settingsErr } = await query.limit(1).maybeSingle();`;

code = code.replace(oldSettingsFetch, newSettingsFetch);

// Also need to update the category and post fetching to only fetch data for the loaded site's client_id!
// But wait, the categories and posts currently don't filter by client_id. Let's fix that too.
const oldCatFetch = `const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });`;

const newCatFetch = `let catQuery = supabase.from('categories').select('*').order('order_index', { ascending: true });
      if (settingsData?.client_id) {
         catQuery = catQuery.eq('client_id', settingsData.client_id);
      }
      const { data: catData } = await catQuery;`;

const oldPostFetch = `const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });`;

const newPostFetch = `let postQuery = supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (settingsData?.client_id) {
         postQuery = postQuery.eq('client_id', settingsData.client_id);
      }
      const { data: postData } = await postQuery;`;

code = code.replace(oldCatFetch, newCatFetch);
code = code.replace(oldPostFetch, newPostFetch);

fs.writeFileSync(file, code);
