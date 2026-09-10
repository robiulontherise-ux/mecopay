import React, { useState } from 'react';
import { supabase, ADMIN_EMAIL } from '../lib/supabaseClient';
import { Category, SiteSettings } from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Radio, 
  Database,
  ExternalLink,
  BookOpen,
  Search
} from 'lucide-react';

interface NavbarProps {
  categories: Category[];
  siteSettings?: SiteSettings | null;
  activeCategory: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectCategory: (categoryId: string | null) => void;
  user: any;
  isAdmin: boolean;
  onOpenAuthModal: (context?: string) => void;
  currentView: 'home' | 'post-detail' | 'admin';
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
  onSimulateLogin?: (email: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  siteSettings,
  activeCategory,
  searchQuery,
  setSearchQuery,
  onSelectCategory,
  user,
  isAdmin,
  onOpenAuthModal,
  currentView,
  onNavigateHome,
  onNavigateAdmin,
}) => {
  const [userDropdownOpen, useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('simulated_user_email');
      window.location.reload();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md text-slate-100 shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Logo & Actions */}
        <div className="flex items-center justify-between h-16 border-b border-slate-800/50">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2 cursor-pointer select-none shrink-0" onClick={onNavigateHome}>
            {siteSettings?.site_logo ? (
              <img src={siteSettings.site_logo} alt="Logo" className="h-8 w-auto object-contain rounded" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400/30">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
            )}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span
                className={`font-black tracking-tight ${
                  siteSettings?.site_name_size === 'small' ? 'text-sm sm:text-base' : 
                  siteSettings?.site_name_size === 'large' ? 'text-xl sm:text-2xl' : 
                  'text-base sm:text-lg'
                }`}
                style={{
                  color: siteSettings?.site_name_color || 'transparent',
                  backgroundImage: siteSettings?.site_name_color ? 'none' : (siteSettings?.primary_color ? `linear-gradient(to right, white, ${siteSettings.primary_color})` : 'linear-gradient(to right, white, #e2e8f0)'),
                  WebkitBackgroundClip: siteSettings?.site_name_color ? 'unset' : 'text',
                  backgroundClip: siteSettings?.site_name_color ? 'unset' : 'text'
                }}
              >
                {siteSettings?.site_name || 'RSG SHOP'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end ml-4">
            {/* Search Icon & Input */}
            <div className={`flex items-center transition-all ${isSearchOpen ? 'w-full max-w-xs' : 'w-auto'}`}>
              {isSearchOpen ? (
                <div className="relative w-full flex items-center animate-in fade-in slide-in-from-right-4 duration-300">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery) setIsSearchOpen(false);
                    }}
                    className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Admin Dashboard CTA (Only shown if Admin Email matches) */}
            {isAdmin && (
              <button
                onClick={onNavigateAdmin}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
                  currentView === 'admin'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-purple-500/30'
                    : 'bg-purple-950/60 text-purple-200 border-purple-700/60 hover:bg-purple-900/60'
                }`}
                title={`Admin CMS Panel for ${ADMIN_EMAIL}`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Admin CMS Studio</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}

          </div>
        </div>

        {/* Bottom Row: Category Navigation Links */}
        <div className="flex flex-wrap items-center justify-center py-2 gap-2 sm:gap-3 w-full border-b border-slate-800/30 relative z-30">
          {categories.filter(c => !c.parent_id).map((cat) => {
            const subcategories = categories.filter(sub => sub.parent_id === cat.id);
            const hasSub = subcategories.length > 0;
            const isCatActive = activeCategory === cat.id || subcategories.some(sub => sub.id === activeCategory);

            return (
              <div key={cat.id} className="relative group">
                <button
                  onClick={() => {
                    onNavigateHome();
                    onSelectCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
                    currentView === 'home' && isCatActive
                      ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30 shadow-sm shadow-indigo-600/10 font-semibold'
                      : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-800/60 hover:border-slate-700/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {cat.name}
                    {hasSub && <span className="text-[10px] opacity-60">▼</span>}
                  </span>
                </button>

                {hasSub && (
                  <div className="absolute left-0 mt-1 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 hidden group-hover:block z-50">
                    {subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateHome();
                          onSelectCategory(sub.id);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                          activeCategory === sub.id
                            ? 'text-indigo-400 bg-indigo-500/10 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
