import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

posts_old = """            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">All Published Posts & Series</h2>
                <p className="text-xs text-slate-400">Manage all articles, question banks, and volumes stored in Supabase.</p>
              </div>
            </div>"""

posts_new = """            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
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

text = text.replace(posts_old, posts_new)


pages_old = """        {activeTab === 'pages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Manage Custom Pages</h2>
              <button
                onClick={() => handleStartNewPost(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom Page</span>
              </button>
            </div>"""

pages_new = """        {activeTab === 'pages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Manage Custom Pages</h2>
                <p className="text-xs text-slate-400">Hidden pages that do not appear in feeds. Share via direct link.</p>
              </div>
              <button
                onClick={() => handleStartNewPost(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Page</span>
              </button>
            </div>"""

text = text.replace(pages_old, pages_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

