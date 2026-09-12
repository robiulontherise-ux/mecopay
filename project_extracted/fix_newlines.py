with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

import re
text = re.sub(r"'-->\n'", r"'-->\\n'", text)

with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)

