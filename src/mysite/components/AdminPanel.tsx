import React, { useState, useEffect } from 'react';
import Editor, { Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnStrikeThrough, Separator, BtnNumberedList, BtnBulletList, BtnLink, BtnClearFormatting, BtnStyles } from 'react-simple-wysiwyg';
import ReactMarkdown from 'react-markdown';
import { Category, Post, SiteSettings } from '../types';
import { ADMIN_EMAIL, supabase } from '../lib/supabaseClient';
import { 
  ShieldCheck, Box, UploadCloud, FolderGit2,  
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Save, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Send, 
  Check, 
  ArrowLeft, 
  Sparkles,
  Link,
  Tag,
  Clock,
  BookOpen,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface AdminPanelProps {
  categories: Category[];
  posts: Post[];
  siteSettings?: SiteSettings | null;
  onSaveSiteSettings?: (settings: SiteSettings) => Promise<void>;
  onSaveCategory: (category: Category) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onSavePost: (post: Post) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onBackToSite: () => void;
  userEmail: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  categories,
  posts,
  siteSettings,
  onSaveSiteSettings,
  onSaveCategory,
  onDeleteCategory,
  onSavePost,
  onDeletePost,
  onBackToSite,
  userEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'pages' | 'categories' | 'new-post' | 'edit-post' | 'site-settings' | 'apps'>('posts');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // State for Site Settings
  const [siteName, setSiteName] = useState(siteSettings?.site_name || '');
  const [siteLogo, setSiteLogo] = useState(siteSettings?.site_logo || '');
  const [primaryColor, setPrimaryColor] = useState(siteSettings?.primary_color || '#6366f1');
  const [textSize, setTextSize] = useState(siteSettings?.text_size || 'normal');
  const [siteNameColor, setSiteNameColor] = useState(siteSettings?.site_name_color || '');
  const [siteNameSize, setSiteNameSize] = useState(siteSettings?.site_name_size || 'normal');
  const [showDefaultHome, setShowDefaultHome] = useState(siteSettings?.show_default_home || false);
  const [defaultHomeContent, setDefaultHomeContent] = useState(siteSettings?.default_home_content || '');
  const [defaultHomeFormatType, setDefaultHomeFormatType] = useState(siteSettings?.default_home_format_type || 'standard');
  const [subdomain, setSubdomain] = useState(siteSettings?.subdomain || '');
  const [customDomain, setCustomDomain] = useState(siteSettings?.custom_domain || '');

  // Form State for Post Creation / Edit
  const [postTitle, setPostTitle] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [postThumbnail, setPostThumbnail] = useState('');
  
  // Custom Display Options
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showDetailsBtn, setShowDetailsBtn] = useState(true);
  const [showShareBtn, setShowShareBtn] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [showFullPost, setShowFullPost] = useState(false);
  const [isCustomPage, setIsCustomPage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editorCursorPos, setEditorCursorPos] = useState<number | null>(null);

  useEffect(() => {
    if (siteSettings) {
      setSiteName(siteSettings.site_name || '');
      setSiteLogo(siteSettings.site_logo || '');
      setPrimaryColor(siteSettings.primary_color || '#6366f1');
      setTextSize(siteSettings.text_size || 'normal');
      setSiteNameColor(siteSettings.site_name_color || '');
      setSiteNameSize(siteSettings.site_name_size || 'normal');
      setShowDefaultHome(siteSettings.show_default_home || false);
      setDefaultHomeContent(siteSettings.default_home_content || '');
      setSubdomain(siteSettings.subdomain || '');
      setCustomDomain(siteSettings.custom_domain || '');
    }
  }, [siteSettings]);
  
  const handleSaveSettingsSubmit = async () => {
    if (!onSaveSiteSettings) return;
    try {
      await onSaveSiteSettings({
        id: siteSettings?.id || 'default',
        client_id: siteSettings?.client_id || undefined,
        site_name: siteName,
        site_logo: siteLogo,
        primary_color: primaryColor,
        text_size: textSize,
        site_name_color: siteNameColor,
        site_name_size: siteNameSize,
        show_default_home: showDefaultHome,
        subdomain: subdomain,
        custom_domain: customDomain,
        default_home_content: defaultHomeFormatType === 'code' && !defaultHomeContent.startsWith('<!-- CODE:') 
          ? `<!-- CODE:live_html -->\n${defaultHomeContent}`
          : defaultHomeContent,
        default_home_format_type: defaultHomeFormatType as 'standard' | 'code'
      });
      showNotice('Site settings updated!');
    } catch (err: any) {
      showNotice('Error saving: ' + err.message);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('post_img').upload(fileName, file);
      if (uploadError) {
        if (uploadError.message.includes('row-level') || uploadError.message.includes('policy')) {
          showNotice("Storage Error: 'post_img' bucket needs public insert policies!");
        } else {
          showNotice("Storage Error: " + uploadError.message);
        }
        throw uploadError;
      }
      const { data: publicUrlData } = supabase.storage.from('post_img').getPublicUrl(fileName);
      const newLogoUrl = publicUrlData.publicUrl;
      setSiteLogo(newLogoUrl);
      
      // Let's explicitly notify the user about the generated URL
      showNotice("Logo uploaded! URL: " + newLogoUrl.substring(0, 30) + "...");
      
      if (onSaveSiteSettings) {
        await onSaveSiteSettings({
          id: 'default',
          site_name: siteName,
          site_logo: newLogoUrl,
          primary_color: primaryColor,
          text_size: textSize,
          site_name_color: siteNameColor,
          site_name_size: siteNameSize,
          show_default_home: showDefaultHome,
          default_home_content: defaultHomeFormatType === 'code' && !defaultHomeContent.startsWith('<!-- CODE:') 
            ? `<!-- CODE:live_html -->
${defaultHomeContent}`
            : defaultHomeContent,
          default_home_format_type: defaultHomeFormatType as 'standard' | 'code'
        });
        showNotice("Logo uploaded and saved successfully!");
      }
    } catch (err: any) {
      console.error('Logo upload error:', err);
      if (!err.message?.includes('policy')) {
         showNotice("Upload Failed: " + (err.message || "Check storage settings"));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isContentImage = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post_img')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('row-level security policy')) {
          alert("Supabase Storage Error: Your Supabase database is blocking image uploads because Row Level Security (RLS) is enabled.\n\nPlease go to your Supabase Dashboard -> SQL Editor and run this query:\n\nCREATE POLICY \"Allow public uploads\" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'post_img');");
        }
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('post_img')
        .getPublicUrl(filePath);
        
      const imageUrl = publicUrlData.publicUrl;

      if (isContentImage) {
        const imageMarkdown = `
<img src="${imageUrl}" alt="Uploaded Image" style="max-width: 100%; border-radius: 8px;" />
`;
        if (isLiveCode) {
          const textarea = document.getElementById('code-editor-textarea') as HTMLTextAreaElement;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const before = postContent.substring(0, start);
            const after = postContent.substring(end);
            setPostContent(before + imageMarkdown + after);
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
              textarea.focus();
            }, 0);
          } else {
            setPostContent(prev => prev + imageMarkdown);
          }
        } else {
           // Rich text editor insertion
           setPostContent(prev => prev + '<br/>' + imageMarkdown + '<br/>');
        }
        showNotice('Image added to content!');
      } else {
        setPostThumbnail(imageUrl);
        showNotice('Thumbnail uploaded!');
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      alert('Error uploading image: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };
  const [postContent, setPostContent] = useState('');
  const [isLiveCode, setIsLiveCode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('live_html');

  // Form State for Category Creation / Edit
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catOrder, setCatOrder] = useState(1);
  const [catDesc, setCatDesc] = useState('');
  const [catParentId, setCatParentId] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleStartNewPost = (isPage = false) => {
    setEditingPost(null);
    setPostTitle('');
    setPostSlug('');
    setPostCategory(categories[0]?.id || '');
    setPostThumbnail('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80');
    setShowDetailsBtn(true);
    setShowShareBtn(true);
    setShowThumbnail(true);
    setShowFullPost(false);
    setIsCustomPage(isPage);
    setPostContent(`# New Admission Module

Write comprehensive lecture notes, problem sets, and key insights here.

##  Key Highlights
- Concept 1
- Concept 2

##  Practice Exercises
1. Problem statement
`);
    setActiveTab('new-post');
  };

  const handleEditPost = (p: Post) => {
    setEditingPost(p);
    setPostTitle(p.title);
    setPostSlug(p.slug);
    setPostCategory(p.category_id);
    setPostThumbnail(p.thumbnail);
    setPostContent(p.content);
    setIsCustomPage(p.is_custom_page ?? false);
    setShowDetailsBtn(p.show_details_btn ?? true);
    setShowShareBtn(p.show_share_btn ?? true);
    setShowThumbnail(p.show_thumbnail ?? true);
    setShowFullPost(p.show_full_post ?? false);
    setActiveTab('edit-post');
  };

  const handleAutoSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setPostSlug(slug);
  };

  const handleSavePostForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) {
      alert('Please provide content.');
      return;
    }

    const finalContent = isLiveCode
      ? `<!-- CODE:${codeLanguage || 'live_html'} -->
${postContent}`
      : postContent;

    const newOrUpdatedPost: Post = {
      id: editingPost?.id || `post_${Date.now()}`,
      title: postTitle.trim(),
      slug: postSlug.trim() || `post-${Date.now()}`,
      content: finalContent,
      category_id: postCategory || categories[0]?.id || 'cat-ssc',
      thumbnail: postThumbnail.trim() || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
      created_at: editingPost?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views_count: editingPost?.views_count || 1,
      is_custom_page: isCustomPage,
      show_details_btn: showDetailsBtn,
      show_share_btn: showShareBtn,
      show_thumbnail: showThumbnail,
      show_full_post: showFullPost,
    };
    // Note: We are no longer adding format_type or code_language to the payload to avoid schema errors on Supabase.


    await onSavePost(newOrUpdatedPost);
    showNotice(editingPost ? 'Post updated successfully!' : 'New post published to Supabase!');
    setActiveTab('posts');
  };

  const handleSaveCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const newCat: Category = {
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: catName.trim(),
      slug: catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      order_index: Number(catOrder),
      description: catDesc.trim(),
      icon_name: 'BookOpen',
    };

    await onSaveCategory(newCat);
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    showNotice('Navbar category updated successfully in Supabase!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Admin Header */}
      <div className="border-b border-slate-800 bg-slate-900/90 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to Student Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  Admin CMS Studio
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Live Supabase Sync
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Authenticated Admin: <strong className="text-purple-300">{userEmail || ADMIN_EMAIL}</strong>
                </p>
              </div>
            </div>
          </div>
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Posts ({posts.filter(p => !p.is_custom_page).length})</span>
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'pages'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pages ({posts.filter(p => p.is_custom_page).length})</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>
            <button
              onClick={() => setActiveTab('site-settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'site-settings'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('apps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'apps'
                  ? 'bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span className="flex items-center gap-1">App Hosting <span className="px-1.5 py-0.5 bg-fuchsia-500/20 text-fuchsia-300 rounded text-[10px] ml-1 uppercase">Beta</span></span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Notice Toast */}
      {statusNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {statusNotice}
            </span>
            <button onClick={() => setStatusNotice(null)} className="text-emerald-400 hover:text-emerald-200">
              
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Workspace */}
      {/* DEBUG: Active Tab is {activeTab} */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* TAB 1: POSTS LIST */}
        {activeTab === 'posts' && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">All Published Posts & Series</h2>
                <p className="text-xs text-slate-400">Manage all articles, question banks, and volumes stored in Supabase.</p>
              </div>
              <button
                onClick={() => handleStartNewPost(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Post</span>
              </button>
            </div>

            <div className="grid gap-3">
              {posts.map((post) => {
                const categoryObj = categories.find((c) => c.id === post.category_id);
                return (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-slate-800 shrink-0 bg-slate-950"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {categoryObj?.name || 'Uncategorized'}
                          </span>

                          <span className="text-[10px] text-slate-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{post.title}</h3>
                        
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + '/#post/' + post.slug);
                          showNotice('Link copied!');
                        }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy Link"
                      >
                        <Link className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Link</span>
                      </button>
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Edit Post"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                            onDeletePost(post.id);
                            showNotice('Post deleted from Supabase.');
                          }
                        }}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

                {/* TAB 2: PAGES LIST */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Manage Custom Pages</h2>
                <p className="text-xs text-slate-400">Hidden pages that do not appear in feeds. Share via direct link.</p>
              </div>
              <button
                onClick={() => handleStartNewPost(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Page</span>
              </button>
            </div>
            {posts.filter(p => p.is_custom_page).length === 0 && (
              <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
                No custom pages found. Create a hidden or standalone page!
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.filter(p => p.is_custom_page).map((post) => (
                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between group hover:border-slate-700 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        Page
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center mt-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + '/#post/' + post.slug);
                        showNotice('Page Link copied!');
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy Link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      <span>Copy Link</span>
                    </button>
                    <button
                      onClick={() => handleEditPost(post)}
                      className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DYNAMIC NAVBAR CATEGORY MANAGER */}
        {activeTab === 'categories' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Category Form */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                {editingCategory ? 'Edit Navbar Category' : 'Add New Category'}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Instantly updates the website header navigation menu and category filtering.
              </p>

              <form onSubmit={handleSaveCategoryForm} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BUET Math Solutions"
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value);
                      if (!editingCategory) {
                        setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. buet-math"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Parent Category (Optional)</label>
                  <select
                    value={catParentId || ''}
                    onChange={(e) => setCatParentId(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 mb-3"
                  >
                    <option value="">None (Main Category)</option>
                    {categories.filter(c => !c.parent_id && c.id !== editingCategory?.id).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Navbar Display Order</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={catOrder}
                    onChange={(e) => setCatOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description for student category cards..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCatName('');
                        setCatSlug('');
                        setCatDesc('');
                      }}
                      className="w-1/3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingCategory ? 'Update Category' : 'Save to Navbar'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Categories List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-white">Active Navbar Links ({categories.length})</h3>
                <span className="text-xs text-slate-400">Order by Index</span>
              </div>

              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center">
                        {cat.order_index}
                      </span>
                      <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        /{cat.slug}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{cat.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCatName(cat.name);
                        setCatSlug(cat.slug);
                        setCatOrder(cat.order_index);
                        setCatDesc(cat.description || '');
                        setCatParentId(cat.parent_id || null);
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                      title="Edit Category"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${cat.name}"? Posts in this category will become uncategorized.`)) {
                          onDeleteCategory(cat.id);
                          showNotice('Category removed.');
                        }
                      }}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

                {/* TAB: APP HOSTING (BaaS) */}
        {activeTab === 'apps' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SITE SETTINGS */}
        {activeTab === 'site-settings' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  Site Design & Settings
                </h3>
                <p className="text-xs text-slate-400 mt-1">Change website name, color, and logo.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Website Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. RSG SHOP"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Website Logo</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={siteLogo}
                    onChange={(e) => setSiteLogo(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="URL or upload..."
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center h-full border border-slate-700"
                    >
                      {isUploading ? '...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Logo Name Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={siteNameColor || '#ffffff'}
                      onChange={(e) => setSiteNameColor(e.target.value)}
                      className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <button onClick={() => setSiteNameColor('')} className="text-[10px] text-slate-400 hover:text-white">Clear</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Logo Name Size</label>
                  <select
                    value={siteNameSize}
                    onChange={(e) => setSiteNameSize(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="small">Small</option>
                    <option value="normal">Normal (Default)</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Primary Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Global Text Size</label>
                  <select
                    value={textSize}
                    onChange={(e) => setTextSize(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="small">Small</option>
                    <option value="normal">Normal (Default)</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subdomain (e.g., client.mecopay.com)</label>
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="client.mecopay.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Custom Domain (e.g., myshop.com)</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="www.myshop.com"
                />
              </div>

              <button
                onClick={handleSaveSettingsSubmit}
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20"
              >
                Save Site Design
              </button>
            </div>

            {/* Default Home Page Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  Default Home Page
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure what shows before selecting any category.</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-800 rounded-xl border border-slate-700">
                <input
                  type="checkbox"
                  checked={showDefaultHome}
                  onChange={(e) => setShowDefaultHome(e.target.checked)}
                  className="w-4 h-4 text-indigo-500 bg-slate-900 border-slate-700 rounded"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-200 block">Enable Default Landing Page</span>
                  <span className="text-xs text-slate-400">Shows the content below instead of all posts on root URL</span>
                </div>
              </label>

              {showDefaultHome && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">Page Content (HTML/Rich Text)</label>
                  <div className="bg-slate-50 text-slate-900 rounded-xl overflow-hidden min-h-[300px]">
                    <Editor
                      value={defaultHomeContent}
                      onChange={(e) => setDefaultHomeContent(e.target.value)}
                      className="w-full p-4 font-sans text-sm"
                    >
                      <Toolbar>
                        <BtnBold />
                        <BtnItalic />
                        <BtnUnderline />
                        <BtnStrikeThrough />
                        <Separator />
                        <BtnNumberedList />
                        <BtnBulletList />
                        <BtnLink />
                        <BtnClearFormatting />
                        <BtnStyles />
                      </Toolbar>
                    </Editor>
                  </div>
                  
                  <button
                    onClick={handleSaveSettingsSubmit}
                    className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20"
                  >
                    Save Landing Page
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3 & 4: CREATE / EDIT POST WITH MARKDOWN STUDIO */}
        {(activeTab === 'new-post' || activeTab === 'edit-post') && (
          <form onSubmit={handleSavePostForm} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {activeTab === 'new-post' ? 'Create New Post / Module' : `Edit: ${editingPost?.title}`}
                </h2>
                <p className="text-xs text-slate-400">Rich Markdown, thumbnails, pricing & Telegram links sync to Supabase.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish to Supabase</span>
                </button>
              </div>
            </div>

            {/* Basic Info Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Post Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. BUET Math Master Volume 1"
                  value={postTitle}
                  onChange={(e) => {
                    setPostTitle(e.target.value);
                    if (!editingPost) handleAutoSlug(e.target.value || `post-${Date.now()}`);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Slug URL</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. buet-math-master-volume-1"
                  value={postSlug}
                  onChange={(e) => setPostSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Category & Thumbnail */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Thumbnail Image</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste URL or upload..."
                    value={postThumbnail}
                    onChange={(e) => setPostThumbnail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center h-full border border-slate-700"
                    >
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* POST DISPLAY SETTINGS - Collapsible */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="w-full flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-750 transition-colors cursor-pointer text-left focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  <span className="text-sm font-bold text-slate-200">Display & Privacy Settings</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${showSettingsPanel ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              
              {showSettingsPanel && (
                <div className="p-4 pt-2 border-t border-slate-700/50 space-y-3 bg-slate-900/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showDetailsBtn} onChange={(e) => setShowDetailsBtn(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                      <span className="text-xs text-slate-300">Show "View Details" Button</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showShareBtn} onChange={(e) => setShowShareBtn(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                      <span className="text-xs text-slate-300">Show "Share" Button</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showThumbnail} onChange={(e) => setShowThumbnail(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                      <span className="text-xs text-slate-300">Show Thumbnail Image</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showFullPost} onChange={(e) => setShowFullPost(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                      <span className="text-xs text-slate-300">Show Full Content in List</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer sm:col-span-2 mt-2 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <input type="checkbox" checked={isCustomPage} onChange={(e) => setIsCustomPage(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                      <div>
                        <span className="text-xs font-bold text-indigo-300 block">Make this a Custom Hidden Page</span>
                        <span className="text-[10px] text-slate-400">If checked, this post will NOT show on the website. It can only be accessed directly via its link.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Content Editor / Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-200">
                    Post Format
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="postFormat" checked={!isLiveCode} onChange={() => setIsLiveCode(false)} className="text-indigo-500 bg-slate-900 border-slate-700" />
                      <span className="text-xs text-slate-300">Normal Post (Rich Text, Color, Size)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="postFormat" checked={isLiveCode} onChange={() => setIsLiveCode(true)} className="text-indigo-500 bg-slate-900 border-slate-700" />
                      <span className="text-xs text-slate-300">Programming Code (Live HTML / Syntax)</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-xs font-bold text-slate-200">
                    Article & Series Content (Supports full HTML, CSS, JavaScript, 3D Animations & Markdown)
                  </label>
                  <p className="text-[11px] text-slate-500">Just paste your code or Markdown here. It will run automatically.</p>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-indigo-600/30 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    Insert Image inside Post
                  </button>
                </div>
              </div>
              {!isLiveCode ? (
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-800 text-slate-900">
                      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Rich Text Editor</div>
                      <Editor
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="w-full p-4 font-sans text-sm leading-relaxed focus:outline-none"
                        style={{ minHeight: '400px' }}
                      >
                        <Toolbar>
                          <BtnBold />
                          <BtnItalic />
                          <BtnUnderline />
                          <BtnStrikeThrough />
                          <Separator />
                          <input 
                            type="color" 
                            onChange={(e) => document.execCommand('foreColor', false, e.target.value)} 
                            title="Text Color" 
                            className="w-6 h-6 p-0 border-0 cursor-pointer bg-transparent" 
                          />
                          <Separator />
                          <select 
                            onChange={(e) => document.execCommand('fontSize', false, e.target.value)} 
                            className="text-xs border border-slate-300 rounded px-1 bg-white text-slate-700 h-6"
                            title="Text Size"
                          >
                            <option value="">Size</option>
                            <option value="2">Small</option>
                            <option value="3">Normal</option>
                            <option value="4">Medium</option>
                            <option value="5">Large</option>
                            <option value="6">X-Large</option>
                            <option value="7">Huge</option>
                          </select>
                          <Separator />
                          <BtnNumberedList />
                          <BtnBulletList />
                          <BtnLink />
                          <BtnClearFormatting />
                          <BtnStyles />
                        </Toolbar>
                      </Editor>
                    </div>
                    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col">
                      <div className="bg-slate-800/80 border-b border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300">Live Preview</div>
                      <div className="p-4 prose prose-invert prose-headings:font-bold max-w-none overflow-y-auto h-[400px]">
                        <ReactMarkdown>{postContent}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700 space-y-1">
                      <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                        All Languages Supported
                      </div>
                      <p className="text-[11px] text-slate-400">
                        You don't need to select a specific language. You can use <strong>HTML, CSS, JS, Python, C++, Java, Node.js, PHP</strong> or any combination of code directly in this editor. It will render raw or interpret web codes automatically!
                      </p>
                    </div>
                    <textarea
                      id="code-editor-textarea"
                      rows={16}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Paste your HTML, JS, CSS, Python, C++ or any other raw code here..."
                      className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
            </div>


          </form>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
