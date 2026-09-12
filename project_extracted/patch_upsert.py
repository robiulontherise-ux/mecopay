import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

pattern = r"""  const handleSaveSiteSettings = async \(settings: SiteSettings\) => \{
    const \{ error \} = await supabase\.from\('site_settings'\)\.upsert\(\[settings\]\);
    if \(error\) \{
      console\.error\('Supabase settings error:', error\);
      throw new Error\(error\.message\);
    \}
    setSiteSettings\(settings\);
  \};"""

new_func = """  const handleSaveSiteSettings = async (settings: SiteSettings) => {
    const { error, data } = await supabase.from('site_settings').upsert([settings]).select();
    if (error) {
      console.error('Supabase settings error:', error);
      throw new Error(error.message);
    }
    if (!data || data.length === 0) {
      throw new Error("RLS Error: Database blocked the save (Row Level Security). Check your table policies!");
    }
    setSiteSettings(settings);
  };"""

text = re.sub(pattern, new_func, text)

with open('src/App.tsx', 'w') as f:
    f.write(text)

