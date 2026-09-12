import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# find Paid Settings
idx1 = text.find("{/* Paid / Volume Settings */}")
idx2 = text.find("{/* Content Editor / Preview */}")

if idx1 != -1 and idx2 != -1:
    text = text[:idx1] + text[idx2:]

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

