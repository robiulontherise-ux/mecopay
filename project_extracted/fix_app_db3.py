import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Replace handleSaveCategory
text = re.sub(r'localStorage\.setItem\(\'custom_categories\', JSON\.stringify\(updated\)\);\n', '', text)
text = re.sub(r'localStorage\.setItem\(\'custom_posts\', JSON\.stringify\(updated\)\);\n', '', text)

with open('src/App.tsx', 'w') as f:
    f.write(text)
