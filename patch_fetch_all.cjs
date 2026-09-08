const fs = require('fs');
const file = '/app/applet/src/mysite/App.tsx';
let code = fs.readFileSync(file, 'utf8');

const newFunc = `  const fetchSupabaseData = useCallback(async () => {
    try {
      // 1. Fetch settings
      let querySettings = supabase.from('site_settings').select('*').eq('id', 'default');
      if (user?.id) {
         querySettings = querySettings.eq('client_id', user.id);
      } else {
         querySettings = querySettings.is('client_id', null);
      }
      
      let { data: settingsData } = await querySettings.maybeSingle();

      // Fallback for logged-in users who don't have settings yet
      if (!settingsData && user?.id) {
        const { data: legacyData } = await supabase.from('site_settings').select('*').eq('id', 'default').is('client_id', null).maybeSingle();
        if (legacyData) settingsData = legacyData;
      }
      
      if (settingsData) setSiteSettings(settingsData);

      // 2. Fetch categories
      let queryCat = supabase.from('categories').select('*').order('order_index', { ascending: true });
      if (user?.id) queryCat = queryCat.eq('client_id', user.id);
      else queryCat = queryCat.is('client_id', null);
      
      const { data: catData } = await queryCat;
      
      // Fallback for logged in users with no categories
      if (user?.id && (!catData || catData.length === 0)) {
         const { data: legacyCat } = await supabase.from('categories').select('*').is('client_id', null).order('order_index', { ascending: true });
         if (legacyCat && legacyCat.length > 0) setCategories(legacyCat);
         else if (catData) setCategories(catData);
      } else if (catData) {
         setCategories(catData);
      }

      // 3. Fetch posts
      let queryPost = supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (user?.id) queryPost = queryPost.eq('client_id', user.id);
      else queryPost = queryPost.is('client_id', null);
      
      const { data: postData } = await queryPost;
      
      // Fallback for logged in users with no posts
      if (user?.id && (!postData || postData.length === 0)) {
         const { data: legacyPost } = await supabase.from('posts').select('*').is('client_id', null).order('created_at', { ascending: false });
         if (legacyPost && legacyPost.length > 0) setPosts(legacyPost);
         else if (postData) setPosts(postData);
      } else if (postData) {
         setPosts(postData);
      }

    } catch (err) {
      console.warn('Error fetching from Supabase', err);
    }
  }, [user?.id]);`;

const pattern = /const fetchSupabaseData = useCallback\(async \(\) => \{[\s\S]*?\}, \[user\?\.id\]\);/;
code = code.replace(pattern, newFunc);
fs.writeFileSync(file, code);
