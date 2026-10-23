import React, { useMemo, useEffect, useRef } from 'react';
import { Category, Post, SiteSettings } from '../types';
import { 
  BookOpen, ArrowRight, Filter, User
} from 'lucide-react';
import { AutoHeightIframe } from './AutoHeightIframe';

interface HomeProps {
  categories: Category[];
  posts: Post[];
  siteSettings?: SiteSettings | null;
  activeCategory: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectPost: (post: Post) => void;
  onOpenAuthModal: (context?: string) => void;
}

const Home: React.FC<HomeProps> = ({
  categories,
  posts,
  siteSettings,
  activeCategory,
  searchQuery,
  setSearchQuery,
  onSelectCategory,
  onSelectPost,
  onOpenAuthModal,
}) => {
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

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Skip custom pages from the public feed
        if (post.is_custom_page) return false;

        if (activeCategory && post.category_id !== activeCategory) return false;
        
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = post.title?.toLowerCase().includes(q) || false;
          if (!matchTitle) return false;
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [posts, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
        
        {/* Optional Default Home / Hero Section */}
        {siteSettings?.show_default_home && !activeCategory && !searchQuery && (
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {(siteSettings.default_home_content && (siteSettings.default_home_content.startsWith('<!-- LIVE_CODE -->') || siteSettings.default_home_content.startsWith('<!-- CODE:'))) ? (
              <iframe
                ref={iframeRef}
                srcDoc={`${siteSettings.default_home_content}<script>
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
                </script>`}
                className="w-full border-none bg-transparent rounded-xl overflow-hidden"
                style={{ minHeight: '500px', height: '100%' }}
                title="Interactive Home Content"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                scrolling="no"
              />
            ) : (
              <div className="prose prose-invert max-w-none p-6 sm:p-10" dangerouslySetInnerHTML={{ __html: siteSettings.default_home_content || '<h1>Welcome to ' + (siteSettings.site_name || 'our site') + '</h1>' }} />
            )}
          </div>
        )}

        {/* Posts Rendering Area */}
        {filteredPosts.length === 0 ? (
          !siteSettings?.show_default_home && (
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
              <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300">No resources found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                We couldn't find any materials matching your current filters. 
                Try clearing your search or selecting a different category.
              </p>
              {(searchQuery) && (
                <button 
                  onClick={() => { setSearchQuery(''); onSelectCategory(null); }}
                  className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors inline-flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Clear Search
                </button>
              )}
            </div>
          )
        ) : (
          <div className="space-y-8">
            {/* 1. Full-Width Direct / Landing Posts */}
            {filteredPosts.filter(p => p.show_as_landing || (filteredPosts.length === 1 && p.format_type === 'code')).map((post) => {
              const hasValidTitle = post.title && !['untitled', 'untitled post'].includes(post.title.trim().toLowerCase());
              return (
                <div key={post.id} className="w-full max-w-full mx-auto bg-transparent border-0 rounded-none overflow-hidden shadow-none">
                  {hasValidTitle && (
                    <div className="py-2.5 px-2 sm:px-4 mb-3 border-b border-slate-800/60 flex items-center justify-between">
                      <h2 className="text-lg sm:text-2xl font-bold text-white">{post.title}</h2>
                      {post.show_share_btn !== false && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + '/#post/' + post.slug);
                          }}
                          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 transition-colors"
                        >
                          Share
                        </button>
                      )}
                    </div>
                  )}
                  {post.format_type === 'code' || post.content.startsWith('<!-- CODE:') ? (
                    <AutoHeightIframe
                      content={post.content}
                      title={hasValidTitle ? post.title : 'Interactive Content'}
                      minHeight={300}
                    />
                  ) : (
                    <div className="p-4 sm:p-6 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
                  )}
                </div>
              );
            })}

            {/* 2. Grid Feed for Standard Posts */}
            {(() => {
              const standardPosts = filteredPosts.filter(p => !p.show_as_landing && !(filteredPosts.length === 1 && p.format_type === 'code'));
              if (standardPosts.length === 0) return null;

              const gridClasses = standardPosts.length === 1 
                ? "max-w-md mx-auto" 
                : standardPosts.length === 2 
                  ? "grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6" 
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

              return (
                <div className={gridClasses}>
                  {standardPosts.map((post) => (
                    <div 
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10"
                    >
                      {(post.show_thumbnail !== false) && (
                        <div className="relative aspect-video overflow-hidden bg-slate-800">
                          {post.thumbnail ? (
                            <img 
                              src={post.thumbnail} 
                              alt={post.title || ''} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-gradient-to-br from-slate-800 to-slate-900">
                              <BookOpen className="w-10 h-10 mb-2 opacity-50" />
                              <span className="text-xs font-medium uppercase tracking-wider">{post.category_id}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col">
                        {post.title && !['untitled', 'untitled post'].includes(post.title.trim().toLowerCase()) ? (
                          <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                            {post.title}
                          </h3>
                        ) : null}
                        
                        {post.show_full_post && (
                          <div className="prose prose-invert prose-sm max-w-none text-slate-300 mb-4 line-clamp-4">
                            {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                          </div>
                        )}
                        
                        <div className="mt-auto flex items-center justify-between border-t border-slate-800/60 pt-4">
                          {(post.show_details_btn !== false) && (
                            <button className="text-indigo-400 flex items-center gap-1.5 text-xs font-semibold group-hover:text-indigo-300 transition-colors ml-auto">
                              View Details
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
