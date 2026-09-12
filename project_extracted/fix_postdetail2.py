with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

start_marker = '<article className="w-full text-slate-200 text-sm leading-relaxed max-w-none overflow-hidden">'
end_marker = '</article>'

import_content = """<article className="w-full text-slate-200 text-sm leading-relaxed max-w-none overflow-hidden">
              {post.format_type === 'code' && post.code_language === 'live_html' ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={srcDocWithResize}
                  className="w-full border-none bg-transparent rounded-xl overflow-hidden"
                  style={{ minHeight: '300px' }}
                  title={post.title || 'Interactive Content'}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  scrolling="no"
                />
              ) : post.format_type === 'code' ? (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      {post.code_language} Code
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(post.content);
                      }}
                      className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded"
                    >
                      Copy Code
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={post.code_language || 'javascript'}
                    style={atomDark}
                    customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}
                    showLineNumbers={true}
                  >
                    {post.content}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <div className="prose prose-invert prose-headings:text-white prose-headings:font-bold prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-slate-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 max-w-none">
                  {post.content && (post.content.includes('<p>') || post.content.includes('<h1>') || post.content.includes('<h2>') || post.content.includes('<br>')) ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  ) : (
                    <ReactMarkdown>{post.content || ''}</ReactMarkdown>
                  )}
                </div>
              )}
            </article>"""

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx) + len(end_marker)

if start_idx != -1 and end_idx != -1:
    new_text = text[:start_idx] + import_content + text[end_idx:]
    with open('src/components/PostDetail.tsx', 'w') as f:
        f.write(new_text)

