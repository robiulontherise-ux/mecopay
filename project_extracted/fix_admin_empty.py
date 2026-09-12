import re
with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Make sure there is NO markdownPreview conditional block left over
# Earlier we removed some conditionals but maybe left an empty div or didn't close them properly

# Check lines around 682
lines = text.split('\n')
for i, line in enumerate(lines[680:710]):
    print(f"{i + 680}: {line}")

