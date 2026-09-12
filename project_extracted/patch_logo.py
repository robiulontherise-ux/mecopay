import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

pattern = r"""  const handleLogoUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{
    const file = e\.target\.files\?\.\[0\];
    if \(!file\) return;
    try \{
      setIsUploading\(true\);
      const fileExt = file\.name\.split\('\.'\)\.pop\(\);
      const fileName = `logo_\$\{Date\.now\(\)\}\.\$\{fileExt\}`;
      const \{ error: uploadError \} = await supabase\.storage\.from\('potimg'\)\.upload\(fileName, file\);
      if \(uploadError\) \{
        if \(uploadError\.message\.includes\('row-level security policy'\)\) \{
          alert\("Supabase Storage Error: Your database is blocking uploads\. Please make sure the 'potimg' bucket exists and has public insert policies\."\);
        \}
        throw uploadError;
      \}
      const \{ data: publicUrlData \} = supabase\.storage\.from\('potimg'\)\.getPublicUrl\(fileName\);
      const newLogoUrl = publicUrlData\.publicUrl;
      setSiteLogo\(newLogoUrl\);
      
      // Auto-save settings when logo is uploaded
      if \(onSaveSiteSettings\) \{
        await onSaveSiteSettings\(\{
          id: 'default',
          site_name: siteName,
          site_logo: newLogoUrl,
          primary_color: primaryColor,
          text_size: textSize,
          site_name_color: siteNameColor,
          site_name_size: siteNameSize,
          show_default_home: showDefaultHome,
          default_home_content: defaultHomeContent
        \}\);
      \}
    \} catch \(err\) \{
      console\.error\('Logo upload error:', err\);
    \} finally \{
      setIsUploading\(false\);
    \}
  \};"""

new_func = """  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('potimg').upload(fileName, file);
      if (uploadError) {
        if (uploadError.message.includes('row-level') || uploadError.message.includes('policy')) {
          showNotice("Storage Error: 'potimg' bucket needs public insert policies!");
        } else {
          showNotice("Storage Error: " + uploadError.message);
        }
        throw uploadError;
      }
      const { data: publicUrlData } = supabase.storage.from('potimg').getPublicUrl(fileName);
      const newLogoUrl = publicUrlData.publicUrl;
      setSiteLogo(newLogoUrl);
      
      if (onSaveSiteSettings) {
        await onSaveSiteSettings({
          id: 'default',
          site_name: siteName,
          site_logo: newLogoUrl,
          primary_color: primaryColor,
          text_size: textSize,
          site_name_color: siteNameColor,
          site_name_size: siteNameSize,
          show_default_home: showDefaultHome,
          default_home_content: defaultHomeFormatType === 'code' && !defaultHomeContent.startsWith('<!-- CODE:') 
            ? `<!-- CODE:live_html -->\\n${defaultHomeContent}`
            : defaultHomeContent,
          default_home_format_type: defaultHomeFormatType as 'standard' | 'code'
        });
        showNotice("Logo uploaded and saved successfully!");
      }
    } catch (err: any) {
      console.error('Logo upload error:', err);
      if (!err.message?.includes('policy')) {
         showNotice("Upload Failed: " + (err.message || "Check storage settings"));
      }
    } finally {
      setIsUploading(false);
    }
  };"""

text = re.sub(pattern, new_func, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

