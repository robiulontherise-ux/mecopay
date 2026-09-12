import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

pattern = r"""  const handleSaveSiteSettings = async \(settings: SiteSettings\) => \{
    try \{
      const \{ error \} = await supabase\.from\('site_settings'\)\.upsert\(\[settings\]\);
      if \(error\) \{
        if \(error\.message\.includes\('does not exist'\)\) \{
          alert\(`Supabase Error:[^`]*`\);
        \} else \{
          alert\(`Database Error: \$\{error\.message\}`\);
        \}
        return;
      \}
      setSiteSettings\(settings\);
    \} catch \(err\) \{
      console\.warn\('Supabase settings error:', err\);
    \}
  \};"""

new_func = """  const handleSaveSiteSettings = async (settings: SiteSettings) => {
    const { error } = await supabase.from('site_settings').upsert([settings]);
    if (error) {
      console.error('Supabase settings error:', error);
      throw new Error(error.message);
    }
    setSiteSettings(settings);
  };"""

text = re.sub(pattern, new_func, text)

with open('src/App.tsx', 'w') as f:
    f.write(text)

