import re

with open('src/components/Home.tsx', 'r') as f:
    text = f.read()

# Fix thumbnail
thumb_pattern = r"""                <div className="relative aspect-video overflow-hidden bg-slate-800">
                  \{post\.thumbnail \? \(
                    <img 
                      src=\{post\.thumbnail\} """

new_thumb = """                {(post.show_thumbnail !== false) && (
                  <div className="relative aspect-video overflow-hidden bg-slate-800">
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} """

text = re.sub(thumb_pattern, new_thumb, text)

# Close thumbnail
thumb_close_pattern = r"""                      <span className="text-xs font-medium uppercase tracking-wider">\{post\.category_id\}</span>
                    </div>
                  \)\}
                </div>"""

new_thumb_close = """                      <span className="text-xs font-medium uppercase tracking-wider">{post.category_id}</span>
                    </div>
                  )}
                </div>
                )}"""

text = re.sub(thumb_close_pattern, new_thumb_close, text)

# Fix details button
btn_pattern = r"""                  <div className="mt-auto flex items-center justify-between border-t border-slate-800/60 pt-4">
                    <button className="text-indigo-400 flex items-center gap-1\.5 text-xs font-semibold group-hover:text-indigo-300 transition-colors ml-auto">
                      View Details
                      <ArrowRight className="w-3\.5 h-3\.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>"""

new_btn = """                  <div className="mt-auto flex items-center justify-between border-t border-slate-800/60 pt-4">
                    {(post.show_details_btn !== false) && (
                      <button className="text-indigo-400 flex items-center gap-1.5 text-xs font-semibold group-hover:text-indigo-300 transition-colors ml-auto">
                        View Details
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>"""

text = re.sub(btn_pattern, new_btn, text)

# Add show_full_post support if needed, but it's not simple to render full HTML here safely if not required. 
# But let's check if the user asked for full post rendering. It's just a checkbox they showed.
# Let's see if we can render the full post or a summary depending on show_full_post.

# Title change maybe? Let's just do details and thumb first.

with open('src/components/Home.tsx', 'w') as f:
    f.write(text)

