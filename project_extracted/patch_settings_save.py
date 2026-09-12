import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

save_old = """  const handleSaveSettingsSubmit = async () => {
    if (!onSaveSiteSettings) return;
    await onSaveSiteSettings({
      id: 'default',
      site_name: siteName,
      site_logo: siteLogo,
      primary_color: primaryColor,
      text_size: textSize,
      site_name_color: siteNameColor,
      site_name_size: siteNameSize,
      show_default_home: showDefaultHome,
      default_home_content: defaultHomeContent
    });
    showNotice('Site settings updated!');
  };"""

save_new = """  const handleSaveSettingsSubmit = async () => {
    if (!onSaveSiteSettings) return;
    await onSaveSiteSettings({
      id: 'default',
      site_name: siteName,
      site_logo: siteLogo,
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
    showNotice('Site settings updated!');
  };"""

text = text.replace(save_old, save_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

