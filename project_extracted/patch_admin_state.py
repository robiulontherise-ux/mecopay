import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Add states for color and size
state_old = """  const [textSize, setTextSize] = useState(siteSettings?.text_size || 'normal');
  const [showDefaultHome, setShowDefaultHome] = useState(siteSettings?.show_default_home || false);"""

state_new = """  const [textSize, setTextSize] = useState(siteSettings?.text_size || 'normal');
  const [siteNameColor, setSiteNameColor] = useState(siteSettings?.site_name_color || '');
  const [siteNameSize, setSiteNameSize] = useState(siteSettings?.site_name_size || 'normal');
  const [showDefaultHome, setShowDefaultHome] = useState(siteSettings?.show_default_home || false);"""

text = text.replace(state_old, state_new)

effect_old = """      setTextSize(siteSettings.text_size || 'normal');
      setShowDefaultHome(siteSettings.show_default_home || false);"""

effect_new = """      setTextSize(siteSettings.text_size || 'normal');
      setSiteNameColor(siteSettings.site_name_color || '');
      setSiteNameSize(siteSettings.site_name_size || 'normal');
      setShowDefaultHome(siteSettings.show_default_home || false);"""

text = text.replace(effect_old, effect_new)

save_old = """      text_size: textSize,
      show_default_home: showDefaultHome,
      default_home_content: defaultHomeContent"""

save_new = """      text_size: textSize,
      site_name_color: siteNameColor,
      site_name_size: siteNameSize,
      show_default_home: showDefaultHome,
      default_home_content: defaultHomeContent"""

text = text.replace(save_old, save_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

