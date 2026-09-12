import re

with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

# Add syntax highlighter import
imports_regex = r"import ReactMarkdown from 'react-markdown';"
imports_replacement = """import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';

SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('sql', sql);"""
text = re.sub(imports_regex, imports_replacement, text)

# Helper to render the post content
helper_regex = r"              \{post\.content && post\.content\.startsWith\('<!-- LIVE_CODE -->'\) \? \("
helper_replacement = """              {post.content && post.content.startsWith('<!-- LIVE_CODE -->') ? ("""
# Actually, let's just do a big replace for the whole article body

article_regex = r"""            <article className="w-full text-slate-200 text-sm leading-relaxed max-w-none overflow-hidden">
              \{post\.content && post\.content\.startsWith\('<!-- LIVE_CODE -->'\) \? \(
                <iframe
                  ref=\{iframeRef\}
                  srcDoc=\{srcDocWithResize\}
                  className="w-full border-none bg-transparent rounded-xl overflow-hidden"
                  style=\{\{ minHeight: '300px' \}\}
                  title=\{post\.title \|\| 'Interactive Content'\}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  scrolling="no"
                \/>
              \) : \(
                <div className="prose prose-invert prose-headings:text-white prose-headings:font-bold prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-slate-950 prose-code:px-1\.5 prose-code:py-0\.5 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                  \{post\.content && post\.content\.includes\('<'\) \? \(
                    <div dangerouslySetInnerHTML=\{\{ __html: post\.content \}\} \/>
                  \) : \(
                    <ReactMarkdown>\{post\.content \|\| ''\}<\/ReactMarkdown>
                  \)\}
                <\/div>
              \)\}
            <\/article>"""

article_replacement = """            <article className="w-full text-slate-200 text-sm leading-relaxed max-w-none overflow-hidden">
              {post.content && post.content.startsWith('<!-- LIVE_CODE -->') ? (
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
                        const code = post.content.split('-->\\n').slice(1).join('-->\\n');
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
                    {post.content.split('-->\\n').length > 1 ? post.content.split('-->\\n').slice(1).join('-->\\n') : post.content}
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

text = re.sub(article_regex, article_replacement, text)

with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)

