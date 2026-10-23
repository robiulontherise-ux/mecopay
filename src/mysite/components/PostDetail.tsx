import { supabase } from '../../lib/supabase';
import React, { useState, useEffect, useRef } from 'react';
import { Category, Post, Profile } from '../types';
import { 
  ArrowLeft, 
  Share2, 
  Check, 
  Calendar, 
  Eye
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
SyntaxHighlighter.registerLanguage('sql', sql);

interface PostDetailProps {
  post: Post;
  category?: Category;
  relatedPosts: Post[];
  user: Profile | null;
  onBack: () => void;
  onSelectPost: (post: Post) => void;
  onOpenAuthModal: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({
  post,
  category,
  relatedPosts,
  user,
  onBack,
  onSelectPost,
  onOpenAuthModal,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'resize' && iframeRef.current && typeof e.data.height === 'number') {
        const cur = parseFloat(iframeRef.current.style.height || '0');
        if (Math.abs(cur - e.data.height) > 6) {
          iframeRef.current.style.height = `${e.data.height}px`;
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const srcDocWithResize = post.content ? `${post.content}
<script>
  var lastH = 0;
  function sendHeight() {
    var h = document.documentElement.scrollHeight;
    if (Math.abs(h - lastH) > 6) {
      lastH = h;
      window.parent.postMessage({ type: 'resize', height: h }, '*');
    }
  }
  window.onload = sendHeight;
  if (window.ResizeObserver) {
    new ResizeObserver(sendHeight).observe(document.body);
  } else {
    new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
  }
</script>` : '';


  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Sticky Header Action Bar */}
      <div className="sticky top-16 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to feed</span>
          </button>
          
          <div className="flex items-center gap-3">
            {post.show_share_btn !== false && (
              <button 
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied Link' : 'Share'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col gap-12">
          
          {/* Main Article Content (8 Cols) */}
          <main className="w-full space-y-8">
            
            {/* Meta Tags */}
            {(category?.name || post.title) ? (
              <div className="space-y-3">
                {category?.name && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {category.name}
                    </span>
                  </div>
                )}

                {post.title ? (
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                    {post.title}
                  </h1>
                ) : null}
              </div>
            ) : null}

            {post.product_type && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg mt-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">
                  {post.product_type === 'physical' ? 'Order Physical Copy' :
                   post.product_type === 'just_form' ? 'Cash on Delivery Order' :
                   'Get Digital Access'}
                </h3>
                
                <p className="text-sm text-slate-400 mb-6">
                  {post.product_type === 'physical' ? 'Pay advance and complete order via cash on delivery.' :
                   post.product_type === 'just_form' ? 'Fill out the form below to order via 100% Cash on Delivery.' :
                   'Get instant digital access to this module.'}
                </p>

                {post.product_type === 'digital' && post.digital_settings?.buttons && (
                  <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-800">
                    {post.digital_settings.buttons.map((btn: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => onOpenAuthModal()}
                        className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all text-sm text-center"
                      >
                        {btn.label || 'Access Now'}
                      </button>
                    ))}
                  </div>
                )}
                {post.product_type !== 'digital' && (
                   <button onClick={() => onOpenAuthModal()} className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition-all text-sm">
                     Place Order Now
                   </button>
                )}
              </div>
            )}
            {/* Featured Image */}
            {post.thumbnail && post.show_thumbnail !== false && (
              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-72 sm:h-96 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Body Content */}
            <article className="w-full text-slate-200 text-sm leading-relaxed max-w-none overflow-hidden">
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
                        const code = post.content.split('-->\n').length > 1 ? post.content.split('-->\n').slice(1).join('-->\n') : post.content.split('-->').slice(1).join('-->');
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
                    {post.content.split('-->\n').length > 1 ? post.content.split('-->\n').slice(1).join('-->\n') : (post.content.split('-->').length > 1 ? post.content.split('-->').slice(1).join('-->') : post.content)}
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
            </article>

          </main>

          {/* Sticky Sidebar (4 Cols) */}
          <aside className="w-full">
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  More in {category?.name || 'This Series'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedPosts.slice(0, 4).map((rp) => (
                    <div
                      key={rp.id}
                      onClick={() => onSelectPost(rp)}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800/80 flex items-center gap-3 cursor-pointer transition-all"
                    >
                      <img
                        src={rp.thumbnail}
                        alt={rp.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden">
                        <h5 className="text-xs font-semibold text-white truncate">{rp.title}</h5>
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
