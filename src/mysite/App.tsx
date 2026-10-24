import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import CheckoutPage from '../components/checkout/CheckoutPage';
import { supabase } from './lib/supabaseClient';
import { Category, Post, SiteSettings } from './types';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PostDetail from './components/PostDetail';
import AdminPanel from './components/AdminPanel';
import LazyAuthModal from './components/LazyAuthModal';
import Footer from './components/Footer';
import CustomerPortal from './components/CustomerPortal';
import type { SharedDashboardPageContext } from '../components/shared-dashboard/types';

export default function App(props: { builderUser?: any, activeSiteId?: string, sharedContext?: SharedDashboardPageContext, onNavigateUpload?: () => void, onBackToHub?: () => void } = {}) {
  const { builderUser, activeSiteId, sharedContext, onNavigateUpload } = props;
  const isSharedMode = Boolean(sharedContext);
  const dataOwnerId = sharedContext?.clientId || builderUser?.id;
  const dataBrandId = sharedContext?.brandId;

  // If this site app is loaded on checkout subdomain or checkout path/session, render the CheckoutPage directly
  const isCheckoutRequest = 
    window.location.hostname.startsWith('checkout.') || 
    window.location.pathname.startsWith('/pay') || 
    window.location.pathname.startsWith('/checkout') || 
    window.location.search.includes('session=');

  if (isCheckoutRequest && !builderUser && !activeSiteId) {
    return (
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    );
  }
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
  const [currentView, setCurrentView] = useState<'home' | 'post-detail' | 'admin' | 'my-account'>('home');
  const [activePost, setActivePost] = useState<Post | null>(null);

  // 4. Modal Triggers, Notifications & Context
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalContext, setAuthModalContext] = useState<string>('navbar');
  const [pendingAction, setPendingAction] = useState<{ type: 'buy_volume' | 'take_exam' | 'telegram'; post: Post } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Dynamic Browser Tab Title & Favicon Synchronizer
  const updateBrowserTabAndFavicon = useCallback((titleName?: string, logoUrl?: string, primaryColor?: string, postTitle?: string) => {
    const effectiveName = titleName?.trim() || '';
    if (!effectiveName || effectiveName === 'Store' || effectiveName === 'MecoPay Store') return;

    // Set tab title: if user is viewing a post, show "Post Title | Site Name", otherwise "Site Name"
    const cleanPostTitle = (postTitle && !['untitled', 'untitled post'].includes(postTitle.trim().toLowerCase()))
      ? postTitle.trim()
      : '';
    const finalTitle = cleanPostTitle ? `${cleanPostTitle} | ${effectiveName}` : effectiveName;
    document.title = finalTitle;

    try {
      localStorage.setItem('cached_site_name', effectiveName);
      localStorage.setItem('mysite_cached_title', effectiveName);
    } catch (e) {}

    // Determine Favicon (Custom client logo or Dynamic letter badge - never mother site logo)
    let faviconUrl = (logoUrl && !logoUrl.includes('cJk7YcMb')) ? logoUrl.trim() : '';
    if (!faviconUrl) {
      // Dynamic crisp SVG favicon badge with the first letter of the brand name
      const char = effectiveName.charAt(0).toUpperCase();
      const color = primaryColor?.trim() || '#6366f1';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${color}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="36" font-weight="bold" fill="#ffffff">${char}</text></svg>`;
      faviconUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    try {
      const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[id='mysite-favicon'], link[id='app-favicon'], link[rel*='icon']");
      if (iconLinks.length > 0) {
        iconLinks.forEach(l => { l.href = faviconUrl; });
      } else {
        const iconLink = document.createElement('link');
        iconLink.id = 'app-favicon';
        iconLink.rel = 'icon';
        iconLink.href = faviconUrl;
        document.head.appendChild(iconLink);
      }

      const appleIconLinks = document.querySelectorAll<HTMLLinkElement>("link[id='mysite-apple-favicon'], link[id='app-apple-favicon'], link[rel='apple-touch-icon']");
      if (appleIconLinks.length > 0) {
        appleIconLinks.forEach(l => { l.href = faviconUrl; });
      } else {
        const appleIconLink = document.createElement('link');
        appleIconLink.id = 'app-apple-favicon';
        appleIconLink.rel = 'apple-touch-icon';
        appleIconLink.href = faviconUrl;
        document.head.appendChild(appleIconLink);
      }

      localStorage.setItem('cached_site_logo', faviconUrl);
      localStorage.setItem('mysite_cached_logo', faviconUrl);
    } catch (e) {}
  }, []);

  // Real-time tab title and favicon sync whenever siteSettings or activePost updates
  useEffect(() => {
    if (siteSettings?.site_name?.trim()) {
      updateBrowserTabAndFavicon(
        siteSettings.site_name,
        siteSettings.site_logo,
        siteSettings.primary_color,
        activePost?.title
      );
    }
  }, [siteSettings?.site_name, siteSettings?.site_logo, siteSettings?.primary_color, activePost?.title, updateBrowserTabAndFavicon]);

  // 5. Meta CAPI Tracking Hook

  // Check if current user is Admin
  const isAdmin = isSharedMode || (user && siteSettings?.client_id && user.id === siteSettings.client_id) ||
                  (user && siteSettings?.owner_email && user.email === siteSettings.owner_email);

  const verifySharedAccess = useCallback(async (action: 'view' | 'edit') => {
    if (!sharedContext) return;
    if (sharedContext.pageKey !== 'website_builder' && sharedContext.pageKey !== '*') {
      throw new Error('This shared access grant is not valid for Website Builder.');
    }
    const { data: allowed, error } = await supabase.rpc('has_dashboard_page_access', {
      p_client_id: sharedContext.clientId,
      p_brand_id: sharedContext.brandId,
      p_page_key: 'website_builder',
      p_action: action,
    });
    if (error) throw error;
    if (allowed !== true) throw new Error(`Active shared ${action} access for Website Builder was not verified.`);
  }, [sharedContext]);

  const verifySharedEditWithFeedback = useCallback(async () => {
    try {
      await verifySharedAccess('edit');
    } catch (error: any) {
      setToast({ message: `Save blocked: ${error?.message || 'Active shared edit access was not verified.'}`, type: 'error' });
      throw error;
    }
  }, [verifySharedAccess]);

  // Fetch initial session & setup auth listener
  useEffect(() => {
    if (builderUser) {
      setUser(builderUser);
      setAuthLoading(false);
      return;
    }
  }, [builderUser]);

  useEffect(() => {
    if (builderUser) return;
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
           const params = new URLSearchParams(window.location.search);
           const paramSubdomain = params.get('subdomain');
           const paramCustomDomain = params.get('custom_domain');
           let currentDomain = window.location.hostname;
           
           let query = supabase.from('site_settings').select('client_id, owner_email');
           
           if (paramSubdomain) {
             query = query.eq('subdomain', paramSubdomain);
           } else if (paramCustomDomain) {
             query = query.eq('domain', paramCustomDomain);
           } else {
             let rawSubdomain = currentDomain.endsWith('.mecopay.space') ? currentDomain.replace('.mecopay.space', '') : null;
             if (rawSubdomain && rawSubdomain !== 'www' && rawSubdomain !== 'mecopay.space') {
               query = query.eq('subdomain', rawSubdomain);
             } else {
               query = query.or(`client_id.eq.${session.user.id},owner_email.eq.${session.user.email},domain.eq.${currentDomain},subdomain.eq.${currentDomain}`);
             }
           }

           query.limit(1).maybeSingle().then(({data}) => {
             const isClient = data && (data.client_id === session.user.id || data.owner_email === session.user.email);
             if (isClient) {
               setCurrentView('admin');
               window.location.hash = 'admin';
             } else {
               // Non-admin customer logged in => go to their portal
               setCurrentView('my-account');
               window.location.hash = 'my-account';
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
      let targetBrandId = dataBrandId || null;

      if (isSharedMode) {
        await verifySharedAccess('view');
        targetClientId = dataOwnerId;
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('client_id', targetClientId)
          .eq('brand_id', targetBrandId)
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        settingsData = data;
      } else if (activeSiteId) {
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
         // Read URL parameters passed by Cloudflare Worker
         const params = new URLSearchParams(window.location.search);
         const paramSubdomain = params.get('subdomain');
         const paramCustomDomain = params.get('custom_domain');
         
         let currentDomain = window.location.hostname;
         
         let query = supabase.from('site_settings').select('*');
         
         if (paramSubdomain) {
           query = query.eq('subdomain', paramSubdomain);
         } else if (paramCustomDomain) {
           query = query.eq('domain', paramCustomDomain);
         } else {
           // Fallback if accessed directly or worker didn't pass params
           let rawSubdomain = currentDomain.endsWith('.mecopay.space') ? currentDomain.replace('.mecopay.space', '') : null;
           if (rawSubdomain && rawSubdomain !== 'www' && rawSubdomain !== 'mecopay.space') {
             query = query.eq('subdomain', rawSubdomain);
           } else {
             query = query.or(`domain.eq.${currentDomain},subdomain.eq.${currentDomain}`);
           }
         }

         const { data, error } = await query.limit(1).maybeSingle();
         
         if (!error && data) {
           settingsData = data;
           targetClientId = data.client_id;
         } else {
           // Fallback for development / preview environments so client site always resolves
           const { data: fallbackSite } = await supabase
             .from('site_settings')
             .select('*')
             .order('created_at', { ascending: false })
             .limit(1)
             .maybeSingle();

           if (fallbackSite) {
             settingsData = fallbackSite;
             targetClientId = fallbackSite.client_id;
           }
         }
      }
      
      if (settingsData) {
        setSiteSettings(settingsData);

        // Subdomain to Custom Domain 301/Canonical Redirect:
        // If the brand has a custom domain configured and user hits the free subdomain outside iframe:
        if (settingsData.domain && !builderUser && typeof window !== 'undefined' && window.self === window.top) {
          const currentHost = window.location.hostname.toLowerCase().trim();
          const targetDomain = settingsData.domain.toLowerCase().trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
          if (targetDomain && currentHost !== targetDomain && currentHost.endsWith('.mecopay.space')) {
            window.location.replace(`https://${targetDomain}${window.location.pathname}${window.location.search}`);
            return;
          }
        }
      }
      
      // Set browser tab title & favicon to the client's custom brand
      if (settingsData?.site_name?.trim()) {
        updateBrowserTabAndFavicon(
          settingsData.site_name,
          settingsData.site_logo,
          settingsData.primary_color,
          activePost?.title
        );
      }

      // Fetch categories
      targetBrandId = settingsData?.brand_id || targetBrandId;
      let catQuery = supabase.from('categories').select('*').order('order_index', { ascending: true });
      if (targetClientId) {
         catQuery = catQuery.eq('client_id', targetClientId);
      }
      if (targetBrandId && !isSharedMode) {
         catQuery = catQuery.or(`brand_id.eq.${targetBrandId},brand_id.is.null`);
      } else if (targetBrandId) {
         catQuery = catQuery.eq('brand_id', targetBrandId);
      }
      const { data: catData, error: catError } = await catQuery;
      if (catError) throw catError;
      
      if (catData) {
        setCategories(catData);
      }

      // Fetch posts
      let postQuery = supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (targetClientId) {
         postQuery = postQuery.eq('client_id', targetClientId);
      }
      if (targetBrandId && !isSharedMode) {
         postQuery = postQuery.or(`brand_id.eq.${targetBrandId},brand_id.is.null`);
      } else if (targetBrandId) {
         postQuery = postQuery.eq('brand_id', targetBrandId);
      }
      const { data: postData, error: postError } = await postQuery;
      if (postError) throw postError;
      
      if (postData) {
        // Strip any legacy 'Untitled Post' or 'Untitled' stored previously in the database
        // and resolve custom display options from digital_settings json column if not direct columns
        const cleanPosts = postData.map((p: any) => {
          const ds = (typeof p.digital_settings === 'object' && p.digital_settings) ? p.digital_settings : {};
          return {
            ...p,
            title: (p.title && ['untitled', 'untitled post'].includes(p.title.trim().toLowerCase())) ? '' : (p.title || ''),
            format_type: p.format_type || ds.format_type || 'standard',
            code_language: p.code_language || ds.code_language || null,
            show_details_btn: p.show_details_btn !== undefined ? p.show_details_btn : (ds.show_details_btn ?? true),
            show_share_btn: p.show_share_btn !== undefined ? p.show_share_btn : (ds.show_share_btn ?? true),
            // The CMS stores display flags in digital_settings for schema compatibility.
            // Prefer that persisted value when the legacy/direct column is null or absent;
            // otherwise a nullable direct column can make a checked checkbox reload unchecked.
            show_thumbnail: ds.show_thumbnail ?? (p.show_thumbnail ?? true),
            show_full_post: p.show_full_post !== undefined ? p.show_full_post : (ds.show_full_post ?? false),
            show_as_landing: p.show_as_landing !== undefined ? p.show_as_landing : (ds.show_as_landing ?? false),
            is_custom_page: p.is_custom_page !== undefined ? p.is_custom_page : (ds.is_custom_page ?? false),
            summary: p.summary || ds.summary || '',
            tags: p.tags || ds.tags || [],
            digital_settings: ds
          };
        });
        setPosts(cleanPosts);
      }
    } catch (err) {
      console.warn('Error fetching from Supabase', err);
    }
  }, [activeSiteId, builderUser, dataBrandId, dataOwnerId, isSharedMode, verifySharedAccess]);
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
      } else if (hash === 'my-account') {
        setCurrentView('my-account');
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

  // Keep browser title in sync with site name
  useEffect(() => {
    if (siteSettings?.site_name?.trim()) {
      document.title = siteSettings.site_name.trim();
    }
  }, [siteSettings?.site_name]);

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const handleSaveCategory = async (cat: Category) => {
    const effectiveClientId = (user?.id && UUID_REGEX.test(user.id))
      ? user.id
      : (siteSettings?.client_id && UUID_REGEX.test(siteSettings.client_id))
        ? siteSettings.client_id
        : null;

    const validCatIds = categories.map((c) => c.id);
    const sanitizedCat: any = {
      id: cat.id || `cat_${Date.now()}`,
      client_id: dataOwnerId || effectiveClientId,
      name: (cat.name || '').trim() || 'General',
      slug: (cat.slug || '').trim() || `cat-${Date.now()}`,
      order_index: typeof cat.order_index === 'number' ? cat.order_index : 0,
      description: cat.description || null,
      icon_name: cat.icon_name || 'BookOpen',
      icon_image: cat.icon_image || null,
      custom_badge: cat.custom_badge || null,
      parent_id: (cat.parent_id && validCatIds.includes(cat.parent_id)) ? cat.parent_id : null,
      brand_id: isSharedMode ? dataBrandId : siteSettings?.brand_id || cat.brand_id || null,
      created_at: cat.created_at || new Date().toISOString()
    };

    try {
      await verifySharedEditWithFeedback();
      const { data, error } = await supabase.from('categories').upsert([sanitizedCat]).select();
      if (error) {
        console.error('Supabase save category error:', error.message);
        alert(`Database Error saving category: ${error.message}`);
        return;
      }
      const savedCat: Category = {
        ...cat,
        ...sanitizedCat,
        ...(data && data[0] ? data[0] : {})
      };
      setCategories((prev) => {
        const idx = prev.findIndex((c) => c.id === savedCat.id);
        let updated;
        if (idx >= 0) {
          updated = [...prev];
          updated[idx] = savedCat;
        } else {
          updated = [...prev, savedCat];
        }
        updated.sort((a, b) => a.order_index - b.order_index);
        return updated;
      });
    } catch (err: any) {
      console.warn('Supabase categories error:', err);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      await verifySharedEditWithFeedback();
      let query = supabase.from('categories').delete().eq('id', catId);
      if (dataOwnerId) query = query.eq('client_id', dataOwnerId);
      if (isSharedMode) query = query.eq('brand_id', dataBrandId);
      const { error } = await query;
      if (error) {
        console.error('Supabase delete category error:', error.message);
        alert(`Error deleting category: ${error.message}`);
        return;
      }
    } catch (err) {
      console.warn('Supabase delete category error:', err);
    }

    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  const handleSavePost = async (post: Post) => {
    const effectiveClientId = (user?.id && UUID_REGEX.test(user.id))
      ? user.id
      : (siteSettings?.client_id && UUID_REGEX.test(siteSettings.client_id))
        ? siteSettings.client_id
        : null;

    const validCatIds = categories.map((c) => c.id);
    const validCategoryId = (post.category_id && validCatIds.includes(post.category_id))
      ? post.category_id
      : null;

    const isUntitlePlaceholder = post.title && ['untitled', 'untitled post'].includes(post.title.trim().toLowerCase());
    const cleanTitle = isUntitlePlaceholder ? '' : (post.title || '').trim();

    // Custom display flags and properties packed safely into digital_settings json column
    // This guarantees schema compatibility even when columns do not exist directly on Supabase 'posts' table
    const digitalSettingsPayload: any = {
      ...(post.digital_settings || {}),
      format_type: post.format_type || 'standard',
      code_language: post.code_language || null,
      show_details_btn: post.show_details_btn !== false,
      show_share_btn: post.show_share_btn !== false,
      show_thumbnail: post.show_thumbnail !== false,
      show_full_post: !!post.show_full_post,
      show_as_landing: !!post.show_as_landing,
      is_custom_page: !!post.is_custom_page,
      summary: post.summary || null,
      tags: post.tags || []
    };

    // Standard known columns for Supabase 'posts' table
    let sanitizedPayload: any = {
      id: post.id || `post_${Date.now()}`,
      client_id: effectiveClientId,
      title: cleanTitle,
      slug: (post.slug || '').trim() || `post-${Date.now()}`,
      content: post.content || '',
      category_id: validCategoryId,
      thumbnail: post.thumbnail || null,
      views_count: typeof post.views_count === 'number' ? post.views_count : 0,
      created_at: post.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product_type: post.product_type || 'physical',
      digital_settings: digitalSettingsPayload,
      brand_id: isSharedMode ? dataBrandId : siteSettings?.brand_id || post.brand_id || null,
    };

    try {
      await verifySharedEditWithFeedback();
      
      // Resilient upsert with auto-recovery:
      // If Supabase reports any unknown column in schema cache, strip it, store in digital_settings, and retry!
      let currentPayload = { ...sanitizedPayload };
      let lastError: any = null;
      let successData: any = null;

      for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error } = await supabase.from('posts').upsert([currentPayload]).select();
        if (!error) {
          successData = data;
          lastError = null;
          break;
        }

        lastError = error;
        const missingColMatch = error.message?.match(/Could not find the '([^']+)' column of 'posts'/i);
        if (missingColMatch && missingColMatch[1]) {
          const missingCol = missingColMatch[1];
          currentPayload.digital_settings = {
            ...(currentPayload.digital_settings || {}),
            [missingCol]: currentPayload[missingCol]
          };
          delete currentPayload[missingCol];
          continue;
        } else {
          break;
        }
      }

      if (lastError) {
        console.error('Supabase save post error:', lastError.message);
        setToast({ message: `Database Notice: ${lastError.message}`, type: 'error' });
        return;
      }

      // Merge saved data with any UI-only fields so preview works seamlessly
      const savedPost: Post = {
        ...post,
        ...sanitizedPayload,
        format_type: post.format_type || 'standard',
        code_language: post.code_language || null,
        show_as_landing: !!post.show_as_landing,
        show_full_post: !!post.show_full_post,
        show_details_btn: post.show_details_btn !== false,
        show_share_btn: post.show_share_btn !== false,
        show_thumbnail: post.show_thumbnail !== false,
        is_custom_page: !!post.is_custom_page,
        ...(successData && successData[0] ? successData[0] : {})
      };

      setPosts((prev) => {
        const idx = prev.findIndex((p) => p.id === savedPost.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = savedPost;
          return updated;
        } else {
          return [savedPost, ...prev];
        }
      });
      setToast({ message: 'Post saved and published successfully!', type: 'success' });
    } catch (err: any) {
      console.warn('Supabase posts error:', err);
      setToast({ message: `Error saving post: ${err?.message || err}`, type: 'error' });
    }
  };

  const handleSaveSiteSettings = async (settings: SiteSettings) => {
    const effectiveClientId = (user?.id && UUID_REGEX.test(user.id))
      ? user.id
      : (siteSettings?.client_id && UUID_REGEX.test(siteSettings.client_id))
        ? siteSettings.client_id
        : null;

    const siteId = siteSettings?.id || settings.id || 'default';
    const sitePayload: any = {
      ...siteSettings,
      ...settings,
      id: siteId,
      site_name: settings.site_name?.trim() || siteSettings?.site_name || 'My Site',
    };
    if (dataOwnerId || effectiveClientId) sitePayload.client_id = dataOwnerId || effectiveClientId;
    if (isSharedMode) sitePayload.brand_id = dataBrandId;
    if (!isSharedMode && sitePayload.website_service_active === undefined) sitePayload.website_service_active = true;
    if (!isSharedMode && !sitePayload.website_service_expires_at) {
      sitePayload.website_service_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    await verifySharedEditWithFeedback();
    // Update only the selected site row, brand-bound in shared mode.
    let updateQuery = supabase.from('site_settings').update(sitePayload);
    if (isSharedMode) {
      updateQuery = updateQuery.eq('client_id', dataOwnerId).eq('brand_id', dataBrandId);
    } else if (sitePayload.id && sitePayload.id !== 'default') {
      updateQuery = updateQuery.eq('id', sitePayload.id);
    } else if (effectiveClientId) {
      updateQuery = updateQuery.eq('client_id', effectiveClientId);
    } else {
      updateQuery = updateQuery.eq('id', siteId);
    }
    const { error: updateError, data: updateData } = await updateQuery.select();

    if (updateError) {
      console.error('Supabase settings update error:', updateError);
      throw new Error(updateError.message);
    }

    // A freelancer may manage an existing site but cannot initialize a new paid site.
    if (!updateData || updateData.length === 0) {
      if (isSharedMode) {
        throw new Error('The client must initialize this website in Website Builder before a freelancer can manage its settings.');
      }
      const { error: insertError } = await supabase.from('site_settings').insert([sitePayload]).select();
      if (insertError) {
        console.error('Supabase settings insert error:', insertError);
        throw new Error(insertError.message);
      }
    }

    setSiteSettings(sitePayload);
    if (sitePayload.site_name) {
      updateBrowserTabAndFavicon(
        sitePayload.site_name,
        sitePayload.site_logo,
        sitePayload.primary_color,
        activePost?.title
      );
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await verifySharedEditWithFeedback();
      let query = supabase.from('posts').delete().eq('id', postId);
      if (dataOwnerId) query = query.eq('client_id', dataOwnerId);
      if (isSharedMode) query = query.eq('brand_id', dataBrandId);
      const { error } = await query;
      if (error) {
        console.error('Supabase delete post error:', error.message);
        setToast({ message: `Error deleting post: ${error.message}`, type: 'error' });
        return;
      }
      setToast({ message: 'Post deleted successfully.', type: 'info' });
    } catch (err) {
      console.warn('Supabase delete post error:', err);
    }

    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className={`${builderUser ? 'min-h-[650px]' : 'min-h-screen'} bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white ${siteSettings?.text_size === 'small' ? 'text-sm' : siteSettings?.text_size === 'large' ? 'text-lg' : 'text-base'}`}>
      
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
            onOpenAuthModal={() => {
              setAuthModalContext('checkout');
              setAuthModalOpen(true);
            }}
          />
        )}
        
        {currentView === 'my-account' && user && !isAdmin && (
          <React.Suspense fallback={<div className="p-8 text-center"><span className="animate-spin text-gray-500">Loading portal...</span></div>}>
            <CustomerPortal siteSettings={siteSettings} user={user} />
          </React.Suspense>
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
      <Footer siteSettings={siteSettings} />

      {/* 4. Modals & Drawers */}
      
      {/* Toast Notification Banner (prevents native browser alerts displaying mecopay.pages.dev) */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[100000] max-w-md flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-bottom-3 duration-200"
          style={{
            backgroundColor: toast.type === 'error' ? 'rgba(153, 27, 27, 0.95)' : toast.type === 'success' ? 'rgba(6, 78, 59, 0.95)' : 'rgba(30, 41, 59, 0.95)',
            borderColor: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#64748b',
            color: '#fff'
          }}
        >
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-xs text-white/70 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors ml-2"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
