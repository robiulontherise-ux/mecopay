import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

edit_btn_old = """                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Edit Post"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit</span>
                      </button>"""

edit_btn_new = """                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + '/#post/' + post.slug);
                          showNotice('Link copied!');
                        }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy Link"
                      >
                        <Link className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Link</span>
                      </button>
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Edit Post"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit</span>
                      </button>"""

text = text.replace(edit_btn_old, edit_btn_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

