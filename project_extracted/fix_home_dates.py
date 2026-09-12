import re

with open('src/components/Home.tsx', 'r') as f:
    text = f.read()

# Remove the date block
date_regex = r"""                  <div className="flex items-center justify-between mb-3">
                    <span className="text-\[10px\] text-slate-500 uppercase tracking-wider font-semibold">
                      \{new Date\(post\.created_at\)\.toLocaleDateString\('en-US', \{ month: 'short', day: 'numeric', year: 'numeric' \}\)\}
                    </span>
                  <\/div>"""

text = re.sub(date_regex, '', text, flags=re.DOTALL)

with open('src/components/Home.tsx', 'w') as f:
    f.write(text)
