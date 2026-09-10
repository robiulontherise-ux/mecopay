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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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

            {/* Auth CTA / User Profile Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-[11px] overflow-hidden">
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      user.email?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate font-medium">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-slate-500 text-[10px]"></span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-slate-200 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">
                        {user.user_metadata?.full_name || 'Enrolled Student'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Super Admin Role
                        </span>
                      )}
                    </div>
                    <div className="py-1">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigateAdmin();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          <span>Admin Content Manager</span>
                        </button>
                      )}
                      <a
                        href="https://t.me/buet_dmc_dreamers_official"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-sky-400" />
                          <span>Telegram Community</span>
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal('navbar')}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-[11px] sm:text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Sign-In</span>
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
                    {hasSub && <span className="text-[10px] opacity-60"></span>}
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
