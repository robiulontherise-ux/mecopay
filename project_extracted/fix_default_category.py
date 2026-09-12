with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

import re

regex = r"category_id: postCategory \|\| categories\[0\]\?\.id \|\| 'cat-buet-eng',"
text = re.sub(regex, "category_id: postCategory || categories[0]?.id || 'cat-ssc',", text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

