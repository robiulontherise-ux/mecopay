const fs = require('fs');
const file = '/app/applet/src/mysite/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// I need to find the exact block and replace it carefully because my regex might have failed.
// Let's just rewrite the fetchSupabaseData function completely to be safe.
const newFunc = `  const fetchSupabaseData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data: catData, error: catErr } = await supabase
        .from('categories').select('*').eq('client_id', user.id)
        .order('order_index', { ascending: true });
      if (!catErr && catData) {
        setCategories(catData);
      }

      const { data: postData, error: postErr } = await supabase
        .from('posts').select('*').eq('client_id', user.id)
        .order('created_at', { ascending: false });
      if (!postErr && postData) {
        setPosts(postData);
      }
      
      let { data: settingsData, error: settingsErr } = await supabase
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
          .maybeSingle(); // Just grab any default row to restore the logo
        
        if (legacyData) {
          settingsData = legacyData;
        }
      }
        
      if (!settingsErr && settingsData) {
        setSiteSettings(settingsData);
      }
    } catch (err) {
      console.warn('Error fetching from Supabase', err);
    }
  }, [user?.id]);`;

const pattern = /const fetchSupabaseData = useCallback\(async \(\) => \{[\s\S]*?\}, \[user\?\.id\]\);/;
code = code.replace(pattern, newFunc);
fs.writeFileSync(file, code);
