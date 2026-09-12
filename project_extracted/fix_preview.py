import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Remove the lower Create Post button
button_regex = r"""              <button
                onClick=\{handleStartNewPost\}
                className="px-3 py-1\.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Post</span>
              </button>"""
              
text = re.sub(button_regex, "", text)


# Update the text area to be side-by-side with a preview
editor_regex = r"""                  <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                    <textarea
                      id="normal-editor-textarea"
                      rows=\{16\}
                      value=\{postContent\}
                      onChange=\{\(e\) => setPostContent\(e\.target\.value\)\}
                      placeholder="Write your article here \(supports Markdown and HTML\)\.\.\."
                      className="w-full p-4 bg-transparent text-slate-100 font-sans text-sm leading-relaxed focus:outline-none focus:ring-0 resize-y"
                    />
                  </div>"""

editor_replacement = """                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                      <div className="bg-slate-800/80 border-b border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300">Editor</div>
                      <textarea
                        id="normal-editor-textarea"
                        rows={16}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Write your article here (supports Markdown)..."
                        className="w-full p-4 bg-transparent text-slate-100 font-sans text-sm leading-relaxed focus:outline-none focus:ring-0 resize-y h-[400px]"
                      />
                    </div>
                    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col">
                      <div className="bg-slate-800/80 border-b border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300">Live Preview</div>
                      <div className="p-4 prose prose-invert prose-headings:font-bold max-w-none overflow-y-auto h-[400px]">
                        <ReactMarkdown>{postContent}</ReactMarkdown>
                      </div>
                    </div>
                  </div>"""

text = re.sub(editor_regex, editor_replacement, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

