import re

with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

# Replace ReactMarkdown rendering with dangerouslySetInnerHTML for non-live code
prose_regex = r"""                <div className="prose prose-invert prose-headings:text-white prose-headings:font-bold prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-slate-950 prose-code:px-1\.5 prose-code:py-0\.5 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                  <ReactMarkdown>\{post\.content \|\| ''\}<\/ReactMarkdown>
                <\/div>"""
prose_replacement = """                <div className="prose prose-invert prose-headings:text-white prose-headings:font-bold prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-slate-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                  {post.content && post.content.includes('<') ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  ) : (
                    <ReactMarkdown>{post.content || ''}</ReactMarkdown>
                  )}
                </div>"""
text = re.sub(prose_regex, prose_replacement, text)

with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)

