import re

with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

article_regex = r"""            <article className="w-full text-slate-200 text-sm leading-relaxed max-w-none overflow-hidden">
              \{post\.format_type === 'code' && post\.code_language === 'live_html' \? \(
                <iframe
                  ref=\{iframeRef\}
                  srcDoc=\{srcDocWithResize\}
                  className="w-full border-none bg-transparent rounded-xl overflow-hidden"
                  style=\{\{ minHeight: '300px' \}\}
                  title=\{post\.title \|\| 'Interactive Content'\}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  scrolling="no"
                \/>
              \) : post\.format_type === 'code' \? \(
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700">
                    <span className="text-\[11px\] font-bold text-slate-300 uppercase tracking-wider">
                      \{post\.code_language\} Code
                    <\/span>
                    <button 
                      onClick=\{\(\) => \{
                        navigator\.clipboard\.writeText\(post\.content\);
                      \}\}
                      className="text-\[10px\] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded"
                    >
                      Copy Code
                    <\/button>
                  <\/div>
                  <SyntaxHighlighter
                    language=\{post\.code_language \|\| 'javascript'\}
                    style=\{atomDark\}
                    customStyle=\{\{ margin: 0, padding: '1\.5rem', background: 'transparent', fontSize: '13px' \}\}
                    showLineNumbers=\{true\}
                  >
                    \{post\.content\}
                  <\/SyntaxHighlighter>
                <\/div>
              \) : \("""
              
article_replacement = """            <article className="w-full text-slate-200 text-sm leading-relaxed max-w-none overflow-hidden">
              {(post.content && (post.content.startsWith('<!-- LIVE_CODE -->') || (post.content.startsWith('<!-- CODE:live_html') || post.content.startsWith('<!-- CODE: live_html')))) ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={srcDocWithResize}
                  className="w-full border-none bg-transparent rounded-xl overflow-hidden"
                  style={{ minHeight: '300px' }}
                  title={post.title || 'Interactive Content'}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  scrolling="no"
                />
              ) : post.content && post.content.startsWith('<!-- CODE:') ? (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      {post.content.split('-->')[0].replace('<!-- CODE:', '').trim()} Code
                    </span>
                    <button 
                      onClick={() => {
                        const code = post.content.split('-->\\n').length > 1 ? post.content.split('-->\\n').slice(1).join('-->\\n') : post.content.split('-->').slice(1).join('-->');
                        navigator.clipboard.writeText(code);
                      }}
                      className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded"
                    >
                      Copy Code
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={post.content.split('-->')[0].replace('<!-- CODE:', '').trim()}
                    style={atomDark}
                    customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}
                    showLineNumbers={true}
                  >
                    {post.content.split('-->\\n').length > 1 ? post.content.split('-->\\n').slice(1).join('-->\\n') : (post.content.split('-->').length > 1 ? post.content.split('-->').slice(1).join('-->') : post.content)}
                  </SyntaxHighlighter>
                </div>
              ) : ("""
text = re.sub(article_regex, article_replacement, text)

with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)

