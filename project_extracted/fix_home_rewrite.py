with open('src/components/Home.tsx', 'w') as f:
    f.write("""import React, { useMemo } from 'react';
import { Category, Post } from '../types';
import { 
  BookOpen, ArrowRight, Filter, User
} from 'lucide-react';

interface HomeProps {
  categories: Category[];
  posts: Post[];
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
  activeCategory,
  searchQuery,
  setSearchQuery,
  onSelectCategory,
  onSelectPost,
  onOpenAuthModal,
}) => {
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {filteredPosts.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-800">
                  {post.thumbnail ? (
                    <img 
                      src={post.thumbnail} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-gradient-to-br from-slate-800 to-slate-900">
                      <BookOpen className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-medium uppercase tracking-wider">{post.category_id}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-slate-800/60 pt-4">
                    <button className="text-indigo-400 flex items-center gap-1.5 text-xs font-semibold group-hover:text-indigo-300 transition-colors ml-auto">
                      View Details
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
""")
