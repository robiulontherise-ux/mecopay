import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { Category, Post, SiteSettings } from './types';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PostDetail from './components/PostDetail';
import AdminPanel from './components/AdminPanel';
import LazyAuthModal from './components/LazyAuthModal';
import Footer from './components/Footer';

export default function App(props: { builderUser?: any, activeSiteId?: string, onNavigateUpload?: () => void, onBackToHub?: () => void } = {}) {
  const { builderUser, activeSiteId, onNavigateUpload } = props;
  // 1. Auth State
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 2. Data State (Categories & Posts)
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // 3. Routing / Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'post-detail' | 'admin'>('home');
  const [activePost, setActivePost] = useState<Post | null>(null);

  // 4. Modal Triggers & Context
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalContext, setAuthModalContext] = useState<string>('navbar');
  const [pendingAction, setPendingAction] = useState<{ type: 'buy_volume' | 'take_exam' | 'telegram'; post: Post } | null>(null);




  // 5. Meta CAPI Tracking Hook

  // Check if current user is Admin
  const isAdmin = user && siteSettings?.client_id && user.id === siteSettings.client_id;

  // Fetch initial session & setup auth listener
  useEffect(() => {
    if (builderUser) {
      setUser(builderUser);
      setAuthLoading(false);
      return;
    }
    // Check real Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        if (window.opener && window.location.hash.includes('access_token')) {
          setTimeout(() => window.close(), 500);
        }
      } else {
        // Check simulated test user for quick preview evaluations
        const simEmail = localStorage.getItem('simulated_user_email');
        if (simEmail) {
          setUser({
            id: 'sim_user_' + simEmail,
            email: simEmail,
            user_metadata: {
              full_name: 'Simulated User',
            },
          });
        }
      }
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (window.opener && window.location.hash.includes('access_token')) {
          setTimeout(() => window.close(), 500);
        }
        // Redirect to admin panel ONLY IF the user is the Admin
        if (_event === 'SIGNED_IN') {
           // Fetch current site settings to see if the logged-in user is the owner
           let domain = window.location.hostname;
           supabase.from('site_settings').select('client_id').or(`client_id.eq.${session.user.id},domain.eq.${domain},subdomain.eq.${domain}`).limit(1).maybeSingle().then(({data}) => {
             if (data && data.client_id === session.user.id) {
               setCurrentView('admin');
               window.location.hash = 'admin';
             }
           });
        }
      } else {
        const simEmail = localStorage.getItem('simulated_user_email');
        if (simEmail) {
          setUser({
            id: 'sim_user_' + simEmail,
            email: simEmail,
            user_metadata: {
              full_name: 'Simulated User',
            },
          });
        } else {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch categories & posts from Supabase (with fallback to local storage / initial data)
        const fetchSupabaseData = useCallback(async () => {
    try {
      let settingsData = null;
      let targetClientId = null;

      if (activeSiteId) {
         // Load by brand ID (which is the site_settings ID now)
         const { data, error } = await supabase
           .from('site_settings')
           .select('*')
           .eq('id', activeSiteId)
           .limit(1)
           .maybeSingle();
           
         if (!error && data) {
           settingsData = data;
           targetClientId = data.client_id;
         }
      } else if (builderUser?.id) {
         // Legacy mode (first site for user)
         targetClientId = builderUser.id;
         const { data, error } = await supabase
           .from('site_settings')
           .select('*')
           .eq('client_id', builderUser.id)
           .limit(1)
           .maybeSingle();
         if (!error && data) settingsData = data;
      } else {
         let currentDomain = window.location.hostname;
         const { data, error } = await supabase
           .from('site_settings')
           .select('*')
           .or(`domain.eq.${currentDomain},subdomain.eq.${currentDomain}`)
           .limit(1)
           .maybeSingle();
         if (!error && data) {
           settingsData = data;
           targetClientId = data.client_id;
         }
      }
      
      if (settingsData) {
        setSiteSettings(settingsData);
      }

      // Fetch categories
      let catQuery = supabase.from('categories').select('*').order('order_index', { ascending: true });
      if (targetClientId) {
         catQuery = catQuery.eq('client_id', targetClientId);
      }
      const { data: catData } = await catQuery;
      
      if (catData) {
        setCategories(catData);
      }

      // Fetch posts
      let postQuery = supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (targetClientId) {
         postQuery = postQuery.eq('client_id', targetClientId);
      }
      const { data: postData } = await postQuery;
      
      if (postData) {
        setPosts(postData);
      }
    } catch (err) {
      console.warn('Error fetching from Supabase', err);
    }
  }, []);
  useEffect(() => {
    fetchSupabaseData();
  }, [fetchSupabaseData]);

  // Sync Hash in URL for deep linking / bookmarking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('post/')) {
        const slug = hash.replace('post/', '');
        const found = posts.find((p) => p.slug === slug || p.id === slug);
        if (found) {
          setActivePost(found);
          setCurrentView('post-detail');
        }
      } else if (hash === 'admin') {
        setCurrentView('admin');
      } else if (hash.startsWith('category/')) {
        const catSlug = hash.replace('category/', '');
        const foundCat = categories.find((c) => c.slug === catSlug || c.id === catSlug);
        if (foundCat) {
          setActiveCategory(foundCat.id);
          setCurrentView('home');
        }
      } else if (hash === '' || hash === 'home') {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [posts, categories, isAdmin]);

  // Navigate to Post Detail
  const handleSelectPost = (post: Post) => {
    setActivePost(post);
    setCurrentView('post-detail');
    window.location.hash = `post/${post.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate Home
  const handleNavigateHome = () => {
    setCurrentView('home');
    setActivePost(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate Admin
  const handleNavigateAdmin = () => {
    if (!user) {
      setAuthModalContext('admin');
      setAuthModalOpen(true);
      return;
    }
    if (isAdmin) {
      setCurrentView('admin');
      window.location.hash = 'admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('Access Restricted. You are not the owner of this website.');
    }
  };

  // --- LAZY AUTH TRIGGERS ---



  // Handle successful login in Lazy Auth Modal
  const handleSuccessLogin = (email: string) => {
    const newUser = {
      id: 'usr_' + Date.now(),
      email: email,
      user_metadata: {
        full_name: email.split('@')[0],
      },
    };
    setUser(newUser);


  };

  // --- ADMIN CMS ACTIONS ---

  const handleSaveCategory = async (cat: Category) => {
    if (!user?.id) return alert('No client ID found (not logged in).');
    cat.client_id = user.id;
    try {
      // 1. Save to Supabase
      const { error } = await supabase.from('categories').upsert([cat]);
      if (error) {
        console.error('Supabase save error:', error.message);
        alert(`Database Error: ${error.message}
(Check if Row Level Security is blocking inserts)`);
        return;
      }
    } catch (err) {
      console.warn('Supabase categories error:', err);
    }

    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === cat.id);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = cat;
      } else {
        updated = [...prev, cat];
      }
      updated.sort((a, b) => a.order_index - b.order_index);
      return updated;
    });
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      await supabase.from('categories').delete().eq('id', catId);
    } catch (err) {
      console.warn('Supabase delete category error:', err);
    }

    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  const handleSavePost = async (post: Post) => {
    if (!user?.id) return alert('No client ID found (not logged in).');
    post.client_id = user.id;
    try {
      const { error } = await supabase.from('posts').upsert([post]);
      if (error) {
        console.error('Supabase save error:', error.message);
        alert(`Database Error: ${error.message}
(Check if Row Level Security is blocking inserts)`);
        return;
      }
    } catch (err) {
      console.warn('Supabase posts error:', err);
    }

    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === post.id);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = post;
      } else {
        updated = [post, ...prev];
      }
      return updated;
    });
  };

  const handleSaveSiteSettings = async (settings: SiteSettings) => {
    if (!user?.id) return alert('No client ID found (not logged in).');
    settings.client_id = user.id;
    // Try to update first
    const { error: updateError, data: updateData } = await supabase.from('site_settings').update(settings).eq('client_id', user.id).select();
    
    if (updateError) {
      console.error('Supabase settings update error:', updateError);
      throw new Error(updateError.message);
    }
    
    // If update affected 0 rows, it means the row doesn't exist, so insert it
    if (!updateData || updateData.length === 0) {
       const { error: insertError, data: insertData } = await supabase.from('site_settings').insert([settings]).select();
       if (insertError) {
          console.error('Supabase settings insert error:', insertError);
          throw new Error(insertError.message);
       }
       if (!insertData || insertData.length === 0) {
          throw new Error("RLS Error: Database blocked the save. Check your table policies!");
       }
    }
    
    setSiteSettings(settings);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await supabase.from('posts').delete().eq('id', postId);
    } catch (err) {
      console.warn('Supabase delete post error:', err);
    }

    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white ${siteSettings?.text_size === 'small' ? 'text-sm' : siteSettings?.text_size === 'large' ? 'text-lg' : 'text-base'}`}>
      
      {siteSettings?.primary_color && (
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            --color-indigo-400: ${siteSettings.primary_color};
            --color-indigo-500: ${siteSettings.primary_color};
            --color-indigo-600: ${siteSettings.primary_color};
          }
          .text-indigo-400, .text-indigo-500, .hover\:text-indigo-400:hover, .group-hover\:text-indigo-400:hover, .group-hover\:text-indigo-300:hover {
            color: var(--color-indigo-500) !important;
          }
          .bg-indigo-500, .bg-indigo-600, .hover\:bg-indigo-600:hover {
            background-color: var(--color-indigo-500) !important;
          }
          .border-indigo-500, .hover\:border-indigo-500:hover, .focus\:ring-indigo-500:focus, .group-hover\:border-indigo-500\/50:hover {
            border-color: var(--color-indigo-500) !important;
          }
          .focus\:ring-indigo-500:focus {
            --tw-ring-color: var(--color-indigo-500) !important;
          }
          .shadow-indigo-500\/10, .hover\:shadow-indigo-500\/10:hover {
            --tw-shadow-color: color-mix(in srgb, var(--color-indigo-500) 10%, transparent);
          }
        `}} />
      )}

      
      {/* 1. Primary Header Navigation */}
      <Navbar
        siteSettings={siteSettings}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          setCurrentView('home');
          window.location.hash = catId ? `category/${categories.find((c) => c.id === catId)?.slug || catId}` : '';
        }}
        user={user}
        isAdmin={isAdmin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAuthModal={(ctx) => {
          setAuthModalContext(ctx || 'navbar');
          setAuthModalOpen(true);
        }}
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onNavigateAdmin={handleNavigateAdmin}
        onBackToHub={props.onBackToHub}
      />

      {/* 2. Main Content Routing View */}
      <div className="flex-1">
        {currentView === 'home' && (
          <Home
            categories={categories}
            posts={posts}
            siteSettings={siteSettings}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectCategory={(catId) => {
              setActiveCategory(catId);
              window.location.hash = catId ? `category/${categories.find((c) => c.id === catId)?.slug || catId}` : '';
            }}
            onSelectPost={handleSelectPost}
            onOpenAuthModal={() => {
              setAuthModalContext('navbar');
              setAuthModalOpen(true);
            }}
          />
        )}

        {currentView === 'post-detail' && activePost && (
          <PostDetail
            post={activePost}
            category={categories.find((c) => c.id === activePost.category_id)}
            relatedPosts={posts.filter((p) => p.category_id === activePost.category_id && p.id !== activePost.id)}
            user={user}
            onBack={handleNavigateHome}
            onSelectPost={handleSelectPost}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            categories={categories}
            posts={posts}
            siteSettings={siteSettings}
            onSaveSiteSettings={handleSaveSiteSettings}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onSavePost={handleSavePost}
            onDeletePost={handleDeletePost}
            onBackToSite={handleNavigateHome}
            onNavigateUpload={onNavigateUpload}
            userEmail={user?.email || 'admin@example.com'}
          />
        )}
      </div>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Modals & Drawers */}
      
      {/* Lazy Authentication Modal */}
      <LazyAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        contextAction={authModalContext}
        onSuccessLogin={handleSuccessLogin}
      />

    </div>
  );
}
