import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

text = text.replace("if (onSaveSiteSettings) {\n          id: 'default',", "if (onSaveSiteSettings) {\n        await onSaveSiteSettings({\n          id: 'default',")

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

