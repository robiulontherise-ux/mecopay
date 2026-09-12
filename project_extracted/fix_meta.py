import re

with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

meta_block = r"""              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1\.5">
                  <User className="w-3\.5 h-3\.5 text-indigo-400" />
                  <span>\{post\.author \|\| 'BUET DMC Dreamers Faculty'\}</span>
                <\/div>
                <div className="flex items-center gap-1\.5">
                  <Calendar className="w-3\.5 h-3\.5 text-slate-500" />
                  <span>\{new Date\(post\.created_at\)\.toLocaleDateString\(undefined, \{ year: 'numeric', month: 'short', day: 'numeric' \}\)\}</span>
                <\/div>
                <div className="flex items-center gap-1\.5">
                  <Clock className="w-3\.5 h-3\.5 text-slate-500" />
                  <span>\{post\.duration_minutes \|\| 20\} min read</span>
                <\/div>
                <div className="flex items-center gap-1\.5">
                  <Eye className="w-3\.5 h-3\.5 text-slate-500" />
                  <span>\{post\.views_count \|\| 1240\} views</span>
                <\/div>
              <\/div>"""

replacement = """              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{post.views_count || 1240} views</span>
                </div>
              </div>"""

text = re.sub(meta_block, replacement, text)

# Also remove the `is_paid` tag
paid_tag = r"""            <div className="flex items-start justify-between gap-4 mb-4">
              <span className=\{`inline-flex items-center px-2\.5 py-1 rounded-full text-\[10px\] font-bold uppercase tracking-wider \$\{
                post\.is_paid 
                  \? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              \}`\}>
                \{post\.is_paid \? 'Premium Series Volume' \: 'Free Lecture Volume'\}
              </span>"""

replacement_tag = """            <div className="flex items-start justify-between gap-4 mb-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Lecture Module
              </span>"""

text = re.sub(paid_tag, replacement_tag, text)

# Remove the price part next to title
price = r"""                  \{post\.is_paid && \(
                    <span className="text-xl font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                      ৳\{post\.price\}
                    </span>
                  \)\}"""
text = re.sub(price, '', text)


with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)

