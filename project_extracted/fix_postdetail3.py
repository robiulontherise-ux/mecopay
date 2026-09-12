with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

import re
text = re.sub(r"const cleanHTML = post\.content\?\.startsWith\('<!-- LIVE_CODE -->\\\\n'\)\n\s*\? post\.content\.replace\('<!-- LIVE_CODE -->\\\\n', ''\)\n\s*: post\.content;", "const cleanHTML = post.content;", text)
text = re.sub(r"const cleanHTML = post\.content\?\.startsWith\('<!-- LIVE_CODE -->'\)\n\s*\? post\.content\.replace\('<!-- LIVE_CODE -->', ''\)\n\s*: post\.content;", "const cleanHTML = post.content;", text)
text = re.sub(r"const cleanHTML = post\.content\?\.replace\('<!-- LIVE_CODE -->\\\\n', ''\)\.replace\('<!-- LIVE_CODE -->', ''\) \|\| '';", "const cleanHTML = post.content || '';", text)

with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)

