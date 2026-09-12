import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

pattern = r"""      const \{ data: postData, error: postErr \} = await supabase
        \.from\('posts'\)
        \.select\('\*'\)
        \.order\('created_at', \{ ascending: false \}\);
      if \(!postErr && postData\) \{
        setPosts\(postData\);
      \}"""

new_pattern = """      const { data: postData, error: postErr } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!postErr && postData) {
        setPosts(postData);
      }
      
      const { data: settingsData, error: settingsErr } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();
        
      if (!settingsErr && settingsData) {
        setSiteSettings(settingsData);
      } else {
        const { data: fallbackData } = await supabase.from('site_settings').select('*').limit(1);
        if (fallbackData && fallbackData.length > 0) {
          setSiteSettings(fallbackData[0]);
        }
      }"""

text = re.sub(pattern, new_pattern, text)

with open('src/App.tsx', 'w') as f:
    f.write(text)

