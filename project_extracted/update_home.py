import re

with open('src/components/Home.tsx', 'r') as f:
    text = f.read()

# filter out is_custom_page
filter_add = """      .filter((post) => {
        // Skip custom pages from the public feed
        if (post.is_custom_page) return false;
"""
text = re.sub(r"      \.filter\(\(post\) => \{", filter_add, text)

# update rendering logic inside Home.tsx to respect the flags
render_old = """              <div 
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-800">
                  {post.thumbnail ? (
                    <img 
                      src={post.thumbnail} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-gradient-to-br from-slate-800 to-slate-900">
                      <BookOpen className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-medium uppercase tracking-wider">{post.category_id}</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  
                  <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-slate-800/60 pt-4">
                    <button className="text-indigo-400 flex items-center gap-1.5 text-xs font-semibold group-hover:text-indigo-300 transition-colors ml-auto">
                      View Details
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>"""

render_new = """              <div 
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10"
              >
                {post.show_thumbnail !== false && (
                  <div className="relative aspect-video overflow-hidden bg-slate-800">
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-gradient-to-br from-slate-800 to-slate-900">
                        <BookOpen className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">{post.category_id}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  
                  <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>

                  {post.show_full_post && (
                    <div className="prose prose-sm prose-invert max-w-none mb-4" dangerouslySetInnerHTML={{ __html: post.content }} />
                  )}
                  
                  <div className="mt-auto flex items-center justify-between border-t border-slate-800/60 pt-4">
                    {post.show_share_btn !== false ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.origin + '/#post/' + post.slug); alert('Link copied to clipboard!'); }} 
                        className="text-slate-400 hover:text-indigo-400 transition-colors text-xs font-semibold flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                        Share
                      </button>
                    ) : <div />}
                    
                    {post.show_details_btn !== false && (
                      <button className="text-indigo-400 flex items-center gap-1.5 text-xs font-semibold group-hover:text-indigo-300 transition-colors ml-auto">
                        View Details
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </div>"""

text = text.replace(render_old, render_new)
with open('src/components/Home.tsx', 'w') as f:
    f.write(text)

