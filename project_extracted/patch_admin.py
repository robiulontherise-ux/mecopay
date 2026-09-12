import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Make the upload button show the uploaded URL for debugging
pattern = r"""      const \{ data: publicUrlData \} = supabase\.storage\.from\('potimg'\)\.getPublicUrl\(fileName\);
      const newLogoUrl = publicUrlData\.publicUrl;
      setSiteLogo\(newLogoUrl\);
      
      if \(onSaveSiteSettings\) \{
        await onSaveSiteSettings\(\{"""

new_pattern = """      const { data: publicUrlData } = supabase.storage.from('potimg').getPublicUrl(fileName);
      const newLogoUrl = publicUrlData.publicUrl;
      setSiteLogo(newLogoUrl);
      
      // Let's explicitly notify the user about the generated URL
      showNotice("Logo uploaded! URL: " + newLogoUrl.substring(0, 30) + "...");
      
      if (onSaveSiteSettings) {"""

text = re.sub(pattern, new_pattern, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

