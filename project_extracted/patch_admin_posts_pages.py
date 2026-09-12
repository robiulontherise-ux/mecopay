import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

posts_tab_old = """        {/* TAB 1: POSTS LIST */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Manage Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => {"""

posts_tab_new = """        {/* TAB 1: POSTS LIST */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Manage Posts</h2>
              <button
                onClick={() => handleStartNewPost(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Post</span>
              </button>
            </div>
            {posts.filter(p => !p.is_custom_page).length === 0 && (
              <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
                No posts found. Create your first post!
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.filter(p => !p.is_custom_page).map((post) => {"""

text = text.replace(posts_tab_old, posts_tab_new)

pages_tab_new = """        {/* TAB 2: PAGES LIST */}
        {activeTab === 'pages' && (
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
            </div>
            {posts.filter(p => p.is_custom_page).length === 0 && (
              <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
                No custom pages found. Create a hidden or standalone page!
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.filter(p => p.is_custom_page).map((post) => (
                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between group hover:border-slate-700 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        Page
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center mt-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + '/#post/' + post.slug);
                        showNotice('Page Link copied!');
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy Link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      <span>Copy Link</span>
                    </button>
                    <button
                      onClick={() => handleEditPostClick(post)}
                      className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeletePostSubmit(post.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}"""

text = text.replace("{/* TAB 2: DYNAMIC NAVBAR CATEGORY MANAGER */}", pages_tab_new + "\n\n        {/* TAB 2: DYNAMIC NAVBAR CATEGORY MANAGER */}")

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

