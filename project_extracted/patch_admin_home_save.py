import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

save_old = """      text_size: textSize,
      show_default_home: showDefaultHome,
      default_home_content: defaultHomeContent,
      default_home_format_type: defaultHomeFormatType as 'standard' | 'code',
    });"""

save_new = """      text_size: textSize,
      show_default_home: showDefaultHome,
      default_home_content: defaultHomeFormatType === 'code' && !defaultHomeContent.startsWith('<!-- CODE:') 
        ? `<!-- CODE:live_html -->\\n${defaultHomeContent}`
        : defaultHomeContent,
      default_home_format_type: defaultHomeFormatType as 'standard' | 'code',
    });"""

text = text.replace(save_old, save_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)
