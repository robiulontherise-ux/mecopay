with open('src/components/PostDetail.tsx', 'w') as f:
    f.write("""import React, { useState } from 'react';
import { Category, Post, Profile } from '../types';
import { 
  ArrowLeft, 
  Share2, 
  Check, 
  Calendar, 
  Eye
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PostDetailProps {
  post: Post;
  category?: Category;
  relatedPosts: Post[];
  user: Profile | null;
  onBack: () => void;
  onSelectPost: (post: Post) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({
  post,
  category,
  relatedPosts,
  user,
  onBack,
  onSelectPost,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

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
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Link' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Article Content (8 Cols) */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Meta Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {category?.name || 'General Module'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                {post.title}
              </h1>

              {/* Author & Info Bar */}
              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{post.views_count || 0} views</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {post.thumbnail && (
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
            <article className="p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-200 text-sm leading-relaxed space-y-4 max-w-none overflow-hidden">
              {post.content && (post.content.includes('<script') || post.content.includes('<style') || post.content.includes('<html') || post.content.includes('<canvas') || post.content.includes('<div')) ? (
                <iframe 
                  srcDoc={post.content} 
                  className="w-full min-h-[500px] border-none bg-transparent rounded-xl overflow-hidden"
                  title={post.title || 'Interactive Content'}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              ) : (
                <div className="prose prose-invert prose-headings:text-white prose-headings:font-bold prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-slate-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                  <ReactMarkdown>{post.content || ''}</ReactMarkdown>
                </div>
              )}
            </article>

          </main>

          {/* Sticky Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  More in {category?.name || 'This Series'}
                </h4>
                <div className="space-y-2.5">
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
                        <p className="text-[10px] text-slate-400">{new Date(rp.created_at).toLocaleDateString()}</p>
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
""")
