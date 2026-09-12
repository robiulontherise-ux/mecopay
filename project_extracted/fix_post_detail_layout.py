import re

with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

# Make it full width
# Find `<div className="grid lg:grid-cols-12 gap-8">` and change it
text = text.replace('<div className="grid lg:grid-cols-12 gap-8">', '<div className="flex flex-col gap-12">')
text = text.replace('<main className="lg:col-span-8 space-y-6">', '<main className="w-full space-y-8">')

# Remove aside and related posts layout constraint
text = text.replace('<aside className="lg:col-span-4 space-y-6">', '<aside className="w-full">')
# Change related posts from list to a grid
text = text.replace('className="space-y-2.5"', 'className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"')

# Remove Dates and Views from PostDetail
meta_to_remove = r"""              \{/\* Author & Info Bar \*/\}
              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1\.5">
                  <Calendar className="w-3\.5 h-3\.5 text-slate-500" />
                  <span>\{new Date\(post\.created_at\)\.toLocaleDateString\(undefined, \{ year: 'numeric', month: 'short', day: 'numeric' \}\)\}</span>
                <\/div>
                <div className="flex items-center gap-1\.5">
                  <Eye className="w-3\.5 h-3\.5 text-slate-500" />
                  <span>\{post\.views_count \|\| 0\} views</span>
                <\/div>
              <\/div>"""
text = re.sub(meta_to_remove, '', text, flags=re.DOTALL)

with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)

