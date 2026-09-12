import re

with open('src/components/Home.tsx', 'r') as f:
    text = f.read()

# I want to add rendering of full post content if `show_full_post` is true.

pattern = r"""                  <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                    \{post\.title\}
                  </h3>"""

new_pattern = """                  <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  {post.show_full_post && (
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 mb-4 line-clamp-4">
                      {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                    </div>
                  )}"""

text = re.sub(pattern, new_pattern, text)

with open('src/components/Home.tsx', 'w') as f:
    f.write(text)

