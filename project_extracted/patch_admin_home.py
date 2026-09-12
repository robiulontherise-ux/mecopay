import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Update state
state_old = """  const [showDefaultHome, setShowDefaultHome] = useState(siteSettings?.show_default_home || false);
  const [defaultHomeContent, setDefaultHomeContent] = useState(siteSettings?.default_home_content || '');"""

state_new = """  const [showDefaultHome, setShowDefaultHome] = useState(siteSettings?.show_default_home || false);
  const [defaultHomeContent, setDefaultHomeContent] = useState(siteSettings?.default_home_content || '');
  const [defaultHomeFormatType, setDefaultHomeFormatType] = useState(siteSettings?.default_home_format_type || 'standard');"""

text = text.replace(state_old, state_new)

# Update effect
effect_old = """    if (siteSettings) {
      setSiteName(siteSettings.site_name);
      setSiteLogo(siteSettings.site_logo);
      setSiteNameColor(siteSettings.site_name_color || '');
      setSiteNameSize(siteSettings.site_name_size || 'normal');
      setPrimaryColor(siteSettings.primary_color);
      setTextSize(siteSettings.text_size);
      setShowDefaultHome(siteSettings.show_default_home);
      setDefaultHomeContent(siteSettings.default_home_content || '');
    }"""

effect_new = """    if (siteSettings) {
      setSiteName(siteSettings.site_name);
      setSiteLogo(siteSettings.site_logo);
      setSiteNameColor(siteSettings.site_name_color || '');
      setSiteNameSize(siteSettings.site_name_size || 'normal');
      setPrimaryColor(siteSettings.primary_color);
      setTextSize(siteSettings.text_size);
      setShowDefaultHome(siteSettings.show_default_home);
      setDefaultHomeContent(siteSettings.default_home_content || '');
      setDefaultHomeFormatType(siteSettings.default_home_format_type || 'standard');
    }"""

text = text.replace(effect_old, effect_new)

# Update handleSaveSettingsSubmit
save_old = """      text_size: textSize,
      show_default_home: showDefaultHome,
      default_home_content: defaultHomeContent,
    });"""

save_new = """      text_size: textSize,
      show_default_home: showDefaultHome,
      default_home_content: defaultHomeContent,
      default_home_format_type: defaultHomeFormatType as 'standard' | 'code',
    });"""

text = text.replace(save_old, save_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

