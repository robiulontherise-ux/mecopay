with open('src/App.tsx', 'r') as f:
    text = f.read()

import re

# Remove pendingAction from modal props
text = re.sub(r'\s*postTitle=\{pendingAction\?\.post\.title\}', '', text)

# Remove the rest
modal_regex = r'      \{/\* Buy Volume & Checkout Modal \*/\}.*?\n    <\/div>\n  \);\n\}'
text = re.sub(modal_regex, '    </div>\n  );\n}', text, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(text)

