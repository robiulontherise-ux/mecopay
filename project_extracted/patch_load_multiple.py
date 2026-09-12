import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

pattern = r"""    const loadSiteSettings = async \(\) => \{
      const \{ data, error \} = await supabase\.from\('site_settings'\)\.select\('\*'\)\.eq\('id', 'default'\)\.maybeSingle\(\);
      if \(error\) \{
        console\.error\("DEBUG: Error loading site_settings on mount:", error\);
      \}
      if \(data\) \{
        setSiteSettings\(data\);
      \} else \{
        // Fallback default settings"""

new_pattern = """    const loadSiteSettings = async () => {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').order('site_name', { ascending: false }).limit(1);
      if (error) {
        console.error("DEBUG: Error loading site_settings on mount:", error);
      }
      if (data && data.length > 0) {
        setSiteSettings(data[0]);
      } else {
        // Fallback default settings"""

text = re.sub(pattern, new_pattern, text)

with open('src/App.tsx', 'w') as f:
    f.write(text)

