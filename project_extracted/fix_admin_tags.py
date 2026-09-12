with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

import re

# Fix missing closing div
textarea_regex = r"""                    <textarea
                      rows=\{16\}
                      value=\{postContent\}
                    onChange=\{\(e\) => setPostContent\(e\.target\.value\)\}
                    placeholder="Paste your C\+\+, Python, Java or HTML/JS/CSS code here\.\.\."
                    className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
                  \/>
                \)"""
textarea_replacement = """                    <textarea
                      rows={16}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Paste your C++, Python, Java or HTML/JS/CSS code here..."
                      className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )"""

text = re.sub(textarea_regex, textarea_replacement, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

