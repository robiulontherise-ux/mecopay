import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

handle_logo_old = """      const { data: publicUrlData } = supabase.storage.from('potimg').getPublicUrl(fileName);
      setSiteLogo(publicUrlData.publicUrl);
    } catch (err) {"""

handle_logo_new = """      const { data: publicUrlData } = supabase.storage.from('potimg').getPublicUrl(fileName);
      const newLogoUrl = publicUrlData.publicUrl;
      setSiteLogo(newLogoUrl);
      
      // Auto-save settings when logo is uploaded
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
          default_home_content: defaultHomeContent
        });
      }
    } catch (err) {"""

text = text.replace(handle_logo_old, handle_logo_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

