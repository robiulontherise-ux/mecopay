const fs = require('fs');
const file = '/app/applet/src/mysite/App.tsx';
let code = fs.readFileSync(file, 'utf8');

const newFunc = `  const fetchSupabaseData = useCallback(async () => {
    try {
      // Fetch settings (Global, so viewers can see it without logging in)
      const { data: settingsData, error: settingsErr } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .limit(1)
        .maybeSingle();
      
      if (!settingsErr && settingsData) {
        setSiteSettings(settingsData);
      }

      // Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (catData) {
        setCategories(catData);
      }

      // Fetch posts
      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (postData) {
        setPosts(postData);
      }
    } catch (err) {
      console.warn('Error fetching from Supabase', err);
    }
  }, []);`;

const pattern = /const fetchSupabaseData = useCallback\(async \(\) => \{[\s\S]*?\}, \[user\?\.id\]\);/;
code = code.replace(pattern, newFunc);
fs.writeFileSync(file, code);
