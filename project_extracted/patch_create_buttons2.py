import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

posts_pattern = r'<div className="flex items-center justify-between mb-4">\s*<div>\s*<h2 className="text-lg font-bold text-white">All Published Posts & Series</h2>\s*<p className="text-xs text-slate-400">Manage all articles, question banks, and volumes stored in Supabase\.</p>\s*</div>\s*</div>'

posts_new = """<div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">All Published Posts & Series</h2>
                <p className="text-xs text-slate-400">Manage all articles, question banks, and volumes stored in Supabase.</p>
              </div>
              <button
                onClick={() => handleStartNewPost(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Post</span>
              </button>
            </div>"""

text = re.sub(posts_pattern, posts_new, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

