import re

with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

# Remove date from related posts
date_regex = r"""<p className="text-\[10px\] text-slate-400">\{new Date\(rp\.created_at\)\.toLocaleDateString\(\)\}<\/p>"""
text = re.sub(date_regex, '', text)

with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)
