import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# I want to find the <select> for codeLanguage and replace it with a text note.
# Let's first search for it exactly.

code_old = """                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <label className="text-xs font-semibold text-slate-300">Programming Language:</label>
                      <select 
                        value={codeLanguage} 
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="live_html">Live HTML/CSS/JS (Interactive)</option>
                        <option value="cpp">C / C++</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="javascript">JavaScript / Node.js</option>
                        <option value="typescript">React / Next.js (TypeScript)</option>
                        <option value="css">CSS / Tailwind</option>
                        <option value="sql">SQL / Database</option>
                      </select>
                    </div>
                    <textarea
                      id="code-editor-textarea"
                      rows={16}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Paste your C++, Python, Java or HTML/JS/CSS code here..."
                      className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>"""

code_new = """                  <div className="space-y-3">
                    <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700 space-y-1">
                      <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                        All Languages Supported
                      </div>
                      <p className="text-[11px] text-slate-400">
                        You don't need to select a specific language. You can use <strong>HTML, CSS, JS, Python, C++, Java, Node.js, PHP</strong> or any combination of code directly in this editor. It will render raw or interpret web codes automatically!
                      </p>
                    </div>
                    <textarea
                      id="code-editor-textarea"
                      rows={16}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Paste your HTML, JS, CSS, Python, C++ or any other raw code here..."
                      className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>"""

text = text.replace(code_old, code_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)
