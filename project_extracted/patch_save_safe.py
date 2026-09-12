import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

pattern = r"""  const handleSaveSiteSettings = async \(settings: SiteSettings\) => \{
    const \{ error, data \} = await supabase\.from\('site_settings'\)\.upsert\(\[settings\]\)\.select\(\);
    if \(error\) \{
      console\.error\('Supabase settings error:', error\);
      throw new Error\(error\.message\);
    \}
    if \(!data \|\| data\.length === 0\) \{
      throw new Error\("RLS Error: Database blocked the save \(Row Level Security\)\. Check your table policies!"\);
    \}
    setSiteSettings\(settings\);
  \};"""

new_pattern = """  const handleSaveSiteSettings = async (settings: SiteSettings) => {
    // Try to update first
    const { error: updateError, data: updateData } = await supabase.from('site_settings').update(settings).eq('id', 'default').select();
    
    if (updateError) {
      console.error('Supabase settings update error:', updateError);
      throw new Error(updateError.message);
    }
    
    // If update affected 0 rows, it means the row doesn't exist, so insert it
    if (!updateData || updateData.length === 0) {
       const { error: insertError, data: insertData } = await supabase.from('site_settings').insert([settings]).select();
       if (insertError) {
          console.error('Supabase settings insert error:', insertError);
          throw new Error(insertError.message);
       }
       if (!insertData || insertData.length === 0) {
          throw new Error("RLS Error: Database blocked the save. Check your table policies!");
       }
    }
    
    setSiteSettings(settings);
  };"""

text = re.sub(pattern, new_pattern, text)

with open('src/App.tsx', 'w') as f:
    f.write(text)

