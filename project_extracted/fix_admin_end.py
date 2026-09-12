import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

duplicate = r"""              \{\!markdownPreview \? \(
                <textarea
                  rows=\{14\}
                  value=\{postContent\}
                  onChange=\{\(e\) => setPostContent\(e\.target\.value\)\}
                  placeholder="Write in Markdown or raw HTML/JS/CSS format\.\.\."
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
                \/>
              \) : \(
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 min-h-\[300px\] prose prose-invert max-w-none text-xs leading-relaxed overflow-hidden">
                  <iframe 
                    srcDoc=\{postContent\} 
                    className="w-full min-h-\[500px\] border-none bg-transparent"
                    title="Live Preview"
                  \/>
                <\/div>
              \)\}
            <\/div>"""

# Find the last occurrence or replace the duplicate block directly.
# Wait, it's easier to just replace two occurrences of the block with one.

pattern = re.compile(duplicate, re.DOTALL)
matches = list(pattern.finditer(text))

if len(matches) > 1:
    # Remove the second match
    match = matches[1]
    text = text[:match.start()] + text[match.end():]
    
with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

