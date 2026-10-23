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
  AlertCircle,
  Maximize2,
  Minimize2,
  HelpCircle,
  X,
  Search,
  Globe
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
  onNavigateUpload?: () => void;
  userEmail: string;
  disableExternalEffects?: boolean;
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
  onNavigateUpload,
  userEmail,
  disableExternalEffects = false,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'pages' | 'categories' | 'new-post' | 'edit-post' | 'site-settings' | 'apps'>('posts');
  const [isFullscreen, setIsFullscreen] = useState(false);
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
  const [footerButtons, setFooterButtons] = useState<Array<{ label: string; url_or_page: string; is_external?: boolean }>>(siteSettings?.footer_buttons || []);

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
  const [showAsLanding, setShowAsLanding] = useState(false);
  const [isCustomPage, setIsCustomPage] = useState(false);
  const [productType, setProductType] = useState<'physical' | 'digital' | 'just_form'>('physical');
  const [digitalSettings, setDigitalSettings] = useState<any>({ buttons: [] });
  const [isUploading, setIsUploading] = useState(false);
  const [editorCursorPos, setEditorCursorPos] = useState<number | null>(null);

  // SEO & Social Meta States
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [activeGuideModal, setActiveGuideModal] = useState<null | {
    title: string;
    subtitle: string;
    whyNeeded: string;
    howToWrite: string;
    examples: string[];
    tips: string;
  }>(null);

  const guideDictionary = {
    overview: {
      title: 'Google ও সোশ্যাল মিডিয়া SEO গাইডলাইন',
      subtitle: 'কীভাবে আপনার পোস্টটি গুগলের প্রথম পাতায় আনবেন',
      whyNeeded: 'সঠিক এসইও (Search Engine Optimization) ছাড়া গুগল বা ফেসবুকে মানুষ সার্চ করলে আপনার সাইটের পোস্ট খুঁজে পাবে না। ভালো টাইটেল ও ডেসক্রিপশন থাকলে সার্চে আসা মানুষদের লিংকে ক্লিক করার সম্ভাবনা ৩০০% বেড়ে যায়।',
      howToWrite: '১. আকর্ষণীয় ও পরিষ্কার টাইটেল দিন (৫০-৬০ অক্ষরের মধ্যে)।\n২. মেটা ডেসক্রিপশনে প্রোডাক্টের দাম, ছাড় এবং প্রধান সুবিধা সংক্ষেপে তুলে ধরুন (১২০-১৫০ অক্ষরের মধ্যে)।\n৩. কাস্টমার যেসব শব্দ লিখে সার্চ দেয় সেগুলো কি-ওয়ার্ড হিসেবে কমা দিয়ে লিখুন।',
      examples: [
        'টাইটেল: T500 Smart Watch - Best Price in BD | Free Delivery',
        'ডেসক্রিপশন: অরিজিনাল T500 ওয়াটারপ্রুফ স্মার্ট ওয়াচ কিনুন আকর্ষণীয় অফারে। ৭ দিনের রিপ্লেসমেন্ট এবং দ্রুত ক্যাশ অন ডেলিভারি!',
        'কি-ওয়ার্ডস: smart watch price bd, t500 watch, waterproof smartwatch'
      ],
      tips: 'পোস্ট হিডেন বা কাস্টম পেজ রাখলে গুগল কখনোই তা ইনডেক্স করবে না। পাবলিকলি র‍্যাঙ্ক করাতে চাইলে নিশ্চিত করুন "Make this a Custom Hidden Page" টিক চিহ্নটি আনচেক করা আছে।'
    },
    seoTitle: {
      title: 'গুগল সার্চ টাইটেল (SEO Title) গাইডলাইন',
      subtitle: 'গুগল সার্চে নীল রঙের যে প্রধান শিরোনামটি ভেসে ওঠে',
      whyNeeded: 'গুগল সার্চে মানুষ যখন কিছু খোঁজে, তখন সবার আগে এই বড় নীল লেখাটি তাদের চোখে পড়ে। এটি দেখেই মানুষ সিদ্ধান্ত নেয় তারা ভেতরে ক্লিক করবে কি না।',
      howToWrite: 'প্রধান কি-ওয়ার্ড দিয়ে শুরু করুন। ৫০ থেকে ৬০ অক্ষরের মধ্যে রাখুন যাতে গুগলের সার্চ রেজাল্টে টাইটেল কেটে না যায় (ডট ডট না হয়)। ব্র্যান্ডের নাম শেষে যুক্ত করুন।',
      examples: [
        'T500 Smart Watch - 40% Discount in BD | MecoPay Store',
        'BUET Admission Math Solution Guide 2026',
        'Organic Honey 500g - 100% Pure & Lab Tested'
      ],
      tips: 'টাইটেল ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে পোস্টের সাধারণ টাইটেলটিই গুগল ব্যবহার করবে।'
    },
    seoDescription: {
      title: 'গুগল মেটা ডেসক্রিপশন (Meta Description / Snippet) গাইডলাইন',
      subtitle: 'সার্চ রেজাল্টের নিচে যে ২ লাইন সারাংশ লেখা থাকে',
      whyNeeded: 'এটি আপনার প্রোডাক্ট বা পোস্টের একটি বিজ্ঞাপন স্লোগানের মতো কাজ করে। এটি পড়ে কাস্টমার সাথে সাথে বুঝতে পারে এই পেজে ঢুকলে সে কী সুবিধা পাবে।',
      howToWrite: '১২০ থেকে ১৬০ অক্ষরের মধ্যে লিখুন। প্রোডাক্টের অফার, সুবিধা, দাম বা অ্যাকশন নেওয়ার আহ্বান (Call to Action যেমন: এখনই অর্ডার করুন) লিখুন।',
      examples: [
        'মাত্র ৯৯০ টাকায় পান অরিজিনাল ওয়াটারপ্রুফ স্মার্ট ওয়াচ। সাথে ৭ দিনের গ্যারান্টি ও ফ্রি ক্যাশ অন ডেলিভারি সুবিধা। স্টক সীমিত, এখনই অর্ডার করুন!',
        'এইচএসসি ও বুয়েট ভর্তি পরীক্ষার জন্য সম্পূর্ণ গণিত প্রশ্নব্যাংক ও সমাধান। সহজে শিখতে আজই রেজিস্টার করুন।'
      ],
      tips: '💡 অটো-স্নাইপেট সুবিধা: আপনি যদি ব্যস্ত থাকেন এবং এই ফিল্ডটি ফাঁকা রেখে পোস্ট পাবলিশ করেন, আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে আপনার পোস্টের কন্টেন্টের প্রথম ১০০-১২০টি ফ্রেশ অক্ষর নিয়ে গুগলের উপযোগী ডেসক্রিপশন তৈরি করে দেবে!'
    },
    seoKeywords: {
      title: 'ফোকাস কি-ওয়ার্ডস ও ট্যাগ (Keywords / Tags) গাইডলাইন',
      subtitle: 'সার্চ বটদের আপনার পোস্টের বিষয়বস্তু সহজে বোঝাতে',
      whyNeeded: 'গুগল সার্চ বট যখন আপনার পেজটি ইনডেক্স করে, তখন এই কি-ওয়ার্ডগুলো পড়ে সে পেজটির মূল বিষয়বস্তু ক্যাটাগরি অনুযায়ী সাজিয়ে নেয়।',
      howToWrite: 'মানুষ যেসব শব্দ গুগলে লিখে সার্চ করতে পারে সেগুলো কমা ( , ) দিয়ে আলাদা করে লিখুন। খুব বেশি শব্দ না দিয়ে প্রধান ৩ থেকে ৫টি প্রাসঙ্গিক কি-ওয়ার্ড দিন।',
      examples: [
        'smart watch bd, t500 smartwatch price, bluetooth watch, men watch online',
        'buet math, admission test tips, engineering question bank'
      ],
      tips: 'কি-ওয়ার্ডের সাথে মূল কন্টেন্টের সামঞ্জস্য থাকা জরুরি।'
    }
  };

  const extractSnippet = (contentStr: string) => {
    if (!contentStr) return '';
    const clean = contentStr
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[#*`_~\[\]()!]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return clean.length > 120 ? clean.substring(0, 117) + '...' : clean;
  };

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
      setFooterButtons(siteSettings.footer_buttons || []);
    }
  }, [siteSettings]);
  
  const handleSaveSettingsSubmit = async () => {
    if (!onSaveSiteSettings) return;
    try {
      await onSaveSiteSettings({
        ...(siteSettings || {}),
        id: siteSettings?.id || 'default',
        site_name: siteName.trim(),
        site_logo: siteLogo,
        primary_color: primaryColor,
        text_size: textSize,
        site_name_color: siteNameColor,
        site_name_size: siteNameSize,
        show_default_home: showDefaultHome,
        default_home_content: defaultHomeFormatType === 'code' && !defaultHomeContent.startsWith('<!-- CODE:') 
          ? `<!-- CODE:live_html -->
${defaultHomeContent}`
          : defaultHomeContent,
        default_home_format_type: defaultHomeFormatType as 'standard' | 'code',
        footer_buttons: footerButtons
      });
      showNotice('Site settings updated!');
    } catch (err: any) {
      showNotice('Error saving: ' + err.message);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disableExternalEffects) {
      alert('Image uploads are disabled in shared mode because storage access is not covered by the active Website Builder grant. Paste an existing image URL instead.');
      return;
    }
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
    if (disableExternalEffects) {
      alert('Image uploads are disabled in shared mode because storage access is not covered by the active Website Builder grant. Paste an existing image URL instead.');
      return;
    }
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
  const [catIconImage, setCatIconImage] = useState('');
  const [catCustomBadge, setCatCustomBadge] = useState('');

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
    setShowAsLanding(false);
    setIsCustomPage(isPage);
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setProductType('physical');
    setDigitalSettings({ buttons: [] });
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
    setSeoTitle(p.title || '');
    setSeoDescription(p.summary || '');
    setSeoKeywords(Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''));
    setShowDetailsBtn(p.show_details_btn ?? true);
    setShowShareBtn(p.show_share_btn ?? true);
    setShowThumbnail(p.show_thumbnail ?? true);
    setShowFullPost(p.show_full_post ?? false);
    setShowAsLanding(p.show_as_landing ?? false);
    setProductType(p.product_type || 'physical');
    setDigitalSettings(p.digital_settings || { buttons: [] });
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

    // Calculate effective SEO summary and tags
    const effectiveSummary = seoDescription.trim() || extractSnippet(postContent);
    const tagsArray = seoKeywords
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    // Validate category exists in categories array or set to null
    const validCategory = categories.find((c) => c.id === postCategory)?.id 
      || (!isCustomPage && categories.length > 0 ? categories[0].id : null);

    const newOrUpdatedPost: Post = {
      id: editingPost?.id || `post_${Date.now()}`,
      title: (postTitle.trim() || seoTitle.trim() || ''),
      slug: postSlug.trim() || `post-${Date.now()}`,
      content: finalContent,
      category_id: validCategory as any,
      thumbnail: postThumbnail.trim() || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
      created_at: editingPost?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views_count: editingPost?.views_count || 1,
      format_type: isLiveCode ? 'code' : 'standard',
      code_language: isLiveCode ? (codeLanguage || 'live_html') : undefined,
      is_custom_page: isCustomPage,
      product_type: productType,
      digital_settings: digitalSettings,
      show_details_btn: showDetailsBtn,
      show_share_btn: showShareBtn,
      show_thumbnail: showThumbnail,
      show_full_post: showFullPost,
      show_as_landing: showAsLanding,
      summary: effectiveSummary,
      tags: tagsArray,
    };

    await onSavePost(newOrUpdatedPost);
    showNotice(isCustomPage 
      ? (editingPost ? 'Custom Page updated successfully!' : 'New Page published successfully!')
      : (editingPost ? 'Post updated successfully!' : 'New post published successfully!')
    );
    setActiveTab(isCustomPage ? 'pages' : 'posts');
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
      icon_image: catIconImage.trim() || undefined,
      custom_badge: catCustomBadge.trim() || undefined,
      parent_id: catParentId || null,
    };

    await onSaveCategory(newCat);
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatIconImage('');
    setCatCustomBadge('');
    showNotice('Navbar category updated successfully in Supabase!');
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-[99999] overflow-y-auto bg-slate-950" : "min-h-screen bg-slate-950 text-slate-100 pb-16"}>
      {/* Top Admin Header */}
      <div className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to Student Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-1.5 rounded-lg transition-colors ${isFullscreen ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'}`}
              title="Toggle Fullscreen Editor"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <div className="h-6 w-px bg-slate-700 mx-1"></div>

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
              {posts.filter(p => !p.is_custom_page).length === 0 && (
                <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
                  No published posts found. Create your first post!
                </div>
              )}
              {posts.filter(p => !p.is_custom_page).map((post) => {
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
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete page "${post.title}"?`)) {
                          onDeletePost(post.id);
                          showNotice('Page deleted.');
                        }
                      }}
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category Icon or Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://.../baby-icon.png or dress-icon.svg"
                    value={catIconImage}
                    onChange={(e) => setCatIconImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">বাচ্চাদের বা মেয়েদের পোশাক ইত্যাদির ছোট আইকন/ছবি দেওয়ার জন্য</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Custom Badge or Sticker Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HOT, NEW, 50% OFF, বা স্পেশাল ব্যাজ"
                    value={catCustomBadge}
                    onChange={(e) => setCatCustomBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description for category..."
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
                        setCatIconImage('');
                        setCatCustomBadge('');
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
                  <div className="flex items-center gap-3">
                    {cat.icon_image ? (
                      <img src={cat.icon_image} alt={cat.name} className="w-9 h-9 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0" />
                    ) : (
                      <span className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {cat.order_index}
                      </span>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                        {cat.custom_badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {cat.custom_badge}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          /{cat.slug}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{cat.description || 'No description provided.'}</p>
                    </div>
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
                        setCatIconImage(cat.icon_image || '');
                        setCatCustomBadge(cat.custom_badge || '');
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
            {/* Content has been moved to the WebsiteBuilderHub upload section */}
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
                      disabled={isUploading || disableExternalEffects}
                    />
                    <button
                      type="button"
                      disabled={isUploading || disableExternalEffects}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center h-full border border-slate-700"
                    >
                      {isUploading ? "..." : "Upload"}
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

            {/* Custom Footer Links & Policy Pages */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Link className="w-4 h-4 text-cyan-400" />
                    ফুটার বাটন ও পলিসি লিংক (Footer Buttons & Policy Links)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ওয়েবসাইটের নিচে Privacy Policy, Refund Policy, Terms, বা কাস্টম প্লেলিস্ট/লিংক বাটন যুক্ত করুন।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFooterButtons(prev => [...prev, { label: 'Privacy Policy', url_or_page: '' }]);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ বাটন যুক্ত করুন</span>
                </button>
              </div>

              {footerButtons.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  কোনো কাস্টম ফুটার লিংক যুক্ত করা হয়নি। উপরে <strong>"+ বাটন যুক্ত করুন"</strong> বাটনে ক্লিক করে Privacy Policy, Refund Policy বা কাস্টম লিংক যুক্ত করুন।
                </div>
              ) : (
                <div className="space-y-3">
                  {footerButtons.map((btn, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex-1 w-full">
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">বাটনের নাম (Label)</label>
                        <input
                          type="text"
                          value={btn.label}
                          onChange={(e) => {
                            const updated = [...footerButtons];
                            updated[idx].label = e.target.value;
                            setFooterButtons(updated);
                          }}
                          placeholder="যেমন: Privacy Policy বা Refund Policy"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="flex-1 w-full">
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">লিংক বা কাস্টম পেজ</label>
                        <div className="flex gap-2">
                          <select
                            value={btn.url_or_page.startsWith('#post/') ? btn.url_or_page : ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                const updated = [...footerButtons];
                                updated[idx].url_or_page = e.target.value;
                                setFooterButtons(updated);
                              }
                            }}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500"
                          >
                            <option value="">কাস্টম পেজ থেকে বাছুন...</option>
                            {posts.filter(p => p.is_custom_page).map(page => (
                              <option key={page.id} value={`#post/${page.slug}`}>
                                📄 {page.title || page.slug}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="বা সরাসরি URL লিখুন"
                            value={btn.url_or_page}
                            onChange={(e) => {
                              const updated = [...footerButtons];
                              updated[idx].url_or_page = e.target.value;
                              setFooterButtons(updated);
                            }}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFooterButtons(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="sm:mt-5 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors"
                        title="Remove Button"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveSettingsSubmit}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ফুটার সেটিংস সেভ করুন</span>
                </button>
              </div>
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
                      disabled={isUploading || disableExternalEffects}
                    />
                    <button
                      type="button"
                      disabled={isUploading || disableExternalEffects}
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
                    <label className="flex items-center gap-2.5 cursor-pointer sm:col-span-2 p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                      <input type="checkbox" checked={showAsLanding} onChange={(e) => setShowAsLanding(e.target.checked)} className="text-cyan-500 bg-slate-900 border-slate-700 rounded w-4 h-4" />
                      <div>
                        <span className="text-xs font-bold text-cyan-300 block">সরাসরি ফুল পেজ / ল্যান্ডিং পেজ হিসেবে দেখাবে (Direct Full-Width Display)</span>
                        <span className="text-[10px] text-slate-400">ছোট ৩-কলামের কার্ডে বন্দি না হয়ে সরাসরি পুরো পেজ জুড়ে লাইভ কোড বা কন্টেন্ট সেন্টারে বড় আকারে প্রদর্শিত হবে।</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer sm:col-span-2 mt-1 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
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

            {/* SEO & SEARCH ENGINE OPTIMIZATION SECTION */}
            {isCustomPage ? (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-200">🔒 কাস্টম হিডেন পেজ (Auto No-Index সক্রিয়)</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      এই পোস্টটি একটি গোপন বা কাস্টম পেজ হিসেবে চিহ্নিত। এটি ওয়েবসাইটের পাবলিক ফিডে থাকবে না এবং আমাদের MecoPay Server SEO Engine স্বয়ংক্রিয়ভাবে <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px]">&lt;meta name="robots" content="noindex, nofollow" /&gt;</code> ট্যাগ যুক্ত করে দেবে। ফলে কোনো সার্চ ইঞ্জিন (Google, Bing) এটি ইনডেক্স বা পাবলিক সার্চে আনবে না।
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      💡 আপনি যদি এটিকে গুগলে র‍্যাঙ্ক করাতে চান এবং সার্চে প্রদর্শন করতে চান, তবে ওপরের ডিসপ্লে সেটিংস থেকে <strong>"Make this a Custom Hidden Page"</strong> অপশনটির টিক তুলে দিন।
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        গুগল সার্চ ও সোশ্যাল এসইও অপটিমাইজেশন (SEO & Social Preview)
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Auto-Index Active
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">গুগল ও সোশ্যাল মিডিয়ায় কাস্টমাররা আপনার এই পোস্টটি ঠিক কেমন দেখবে তা নিয়ন্ত্রণ করুন।</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveGuideModal(guideDictionary.overview)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-colors hover:bg-indigo-500/20"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>SEO গাইডলাইন</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Left Column: Form Inputs */}
                  <div className="space-y-4">
                    {/* 1. SEO Meta Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>গুগল সার্চ টাইটেল (SEO Title)</span>
                          <button
                            type="button"
                            onClick={() => setActiveGuideModal(guideDictionary.seoTitle)}
                            className="text-indigo-400 hover:text-indigo-300 p-0.5 rounded hover:bg-slate-800 cursor-pointer"
                            title="কীভাবে লিখবেন তা দেখুন"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </label>
                        <span className={`text-[10px] ${seoTitle.length > 60 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {seoTitle.length}/60 অক্ষর
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder={postTitle || "যেমন: T500 Smart Watch - 40% Off in Bangladesh"}
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে মূল পোস্টের টাইটেলটি ব্যবহৃত হবে।</p>
                    </div>

                    {/* 2. Meta Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>গুগল মেটা ডেসক্রিপশন (Meta Description)</span>
                          <button
                            type="button"
                            onClick={() => setActiveGuideModal(guideDictionary.seoDescription)}
                            className="text-indigo-400 hover:text-indigo-300 p-0.5 rounded hover:bg-slate-800 cursor-pointer"
                            title="কীভাবে লিখবেন তা দেখুন"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </label>
                        <span className={`text-[10px] ${seoDescription.length > 160 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {seoDescription.length}/160 অক্ষর
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="যেমন: অরিজিনাল T500 স্মার্ট ওয়াচ পান মাত্র ৯৯০ টাকায়। ৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি ও সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা..."
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-400/90">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        <span>খালি রাখলে কন্টেন্টের প্রথম ১০০ অক্ষর স্বয়ংক্রিয়ভাবে ডেসক্রিপশন হিসেবে যুক্ত হবে।</span>
                      </div>
                    </div>

                    {/* 3. Keywords / Tags */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>ফোকাস কি-ওয়ার্ডস ও ট্যাগ (Keywords / Tags)</span>
                          <button
                            type="button"
                            onClick={() => setActiveGuideModal(guideDictionary.seoKeywords)}
                            className="text-indigo-400 hover:text-indigo-300 p-0.5 rounded hover:bg-slate-800 cursor-pointer"
                            title="কীভাবে লিখবেন তা দেখুন"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="smart watch, t500, online shopping, mecopay"
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">শব্দগুলোর মাঝে কমা ( , ) ব্যবহার করে কি-ওয়ার্ড লিখুন।</p>
                    </div>
                  </div>

                  {/* Right Column: Real-Time Live Google Search Simulator Preview */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>গুগল সার্চে যেমন দেখাবে (Google Search Live Preview)</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Live Simulator
                      </span>
                    </div>

                    {/* Simulated Google Search Result Card */}
                    <div className="p-4 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-md flex-1 flex flex-col justify-center font-sans">
                      {/* Favicon + Breadcrumb URL */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                          {siteLogo ? (
                            <img src={siteLogo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-indigo-600">M</span>
                          )}
                        </div>
                        <div className="overflow-hidden text-[12px] leading-tight text-slate-700">
                          <div className="font-medium text-slate-900 truncate">{siteName || "MecoPay Store"}</div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {window.location.origin}/post/{postSlug || "your-post-slug"}
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 leading-snug">
                        {seoTitle.trim() || postTitle.trim() || "পোস্টের আকর্ষণীয় শিরোনাম এখানে দেখতে পাবেন"}
                      </h4>

                      {/* Snippet / Description */}
                      <p className="text-xs text-[#4d5156] mt-1 line-clamp-2 leading-relaxed">
                        {seoDescription.trim() || extractSnippet(postContent) || "এখানে আপনার পোস্ট বা প্রোডাক্টের সংক্ষিপ্ত বিবরণ দেখা যাবে, যা পড়ে গুগলের কাস্টমাররা লিংকে ক্লিক করবে..."}
                      </p>

                      {/* Simulated Rich Snippet for Product */}
                      {productType && productType !== 'just_form' && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-3 text-[11px] text-emerald-700 font-medium">
                          <span>✓ ইন স্টক (In stock)</span>
                          <span>•</span>
                          <span>দ্রুত হোম ডেলিভারি</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-[11px] text-slate-400 mt-2 text-center">
                      💡 এটি ড্যাশবোর্ডের লাইভ প্রিভিউ। পোস্ট পাবলিশ হলে গুগলের সার্চ রেজাল্টেও মানুষ ঠিক এভাবেই দেখতে পাবে।
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                    disabled={isUploading || disableExternalEffects}
                  />
                  <button
                    type="button"
                    disabled={isUploading || disableExternalEffects}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-indigo-600/30 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    Insert Image inside Post
                  </button>
                </div>
              </div>
              {!isLiveCode ? (
                <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-800 text-slate-900 shadow-xl">
                  <div className="bg-slate-200 border-b border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Visual Rich Text Editor (সরাসরি কালার, ফন্ট ও ইমেজ দিয়ে ফরম্যাট করুন)</span>
                    <span className="text-[11px] text-slate-500 font-normal">What You See Is What You Get</span>
                  </div>
                  <Editor
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full p-5 font-sans text-sm leading-relaxed focus:outline-none min-h-[420px]"
                    style={{ minHeight: '420px' }}
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
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700 space-y-1">
                    <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                      All Languages Supported (Live Code Mode)
                    </div>
                    <p className="text-[11px] text-slate-400">
                      You can paste <strong>HTML, CSS, JS</strong> or any interactive web landing page code here. The live preview updates on the right automatically!
                    </p>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <div className="bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-slate-300 border border-b-0 border-slate-700 rounded-t-xl">
                        Code Editor (HTML / CSS / JS)
                      </div>
                      <textarea
                        id="code-editor-textarea"
                        rows={18}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Paste your HTML, JS, CSS, Python, C++ or any other raw code here..."
                        className="w-full flex-1 p-4 rounded-b-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
                        style={{ minHeight: '420px' }}
                      />
                    </div>
                    <div className="flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
                      <div className="bg-slate-800/80 border-b border-slate-700 px-3.5 py-1.5 text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          লাইভ প্রিভিউ (Real-Time Live Rendering)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                          Live Sandbox
                        </span>
                      </div>
                      <div className="flex-1 bg-white relative overflow-hidden min-h-[420px]">
                        <iframe
                          srcDoc={postContent || '<div style="padding:40px;text-align:center;color:#888;font-family:sans-serif;">কন্টেন্ট বা কোড লিখলে এখানে রিয়েল-টাইম প্রিভিউ ভেসে উঠবে...</div>'}
                          className="w-full h-full border-none"
                          style={{ minHeight: '420px' }}
                          title="Live Code Preview"
                          sandbox="allow-scripts allow-same-origin allow-forms"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>


              {!isCustomPage && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg mt-6">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  Product Delivery & Checkout Logic
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setProductType('physical')}
                    className={`p-4 rounded-xl border text-left transition-all ${productType === 'physical' ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                  >
                    <h4 className="font-semibold text-slate-200 text-sm">Physical Product</h4>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductType('just_form')}
                    className={`p-4 rounded-xl border text-left transition-all ${productType === 'just_form' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                  >
                    <h4 className="font-semibold text-slate-200 text-sm">Just Form (100% COD)</h4>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductType('digital')}
                    className={`p-4 rounded-xl border text-left transition-all ${productType === 'digital' ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                  >
                    <h4 className="font-semibold text-slate-200 text-sm">Digital / Course</h4>
                  </button>
                </div>

                {productType === 'digital' && (
                  <div className="border-t border-slate-800 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-200 text-sm">Dynamic Access Buttons</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const btns = digitalSettings.buttons || [];
                          setDigitalSettings({ ...digitalSettings, buttons: [...btns, { label: 'Take Exam', page_id: '' }] });
                        }}
                        className="text-xs px-3 py-1.5 bg-fuchsia-500/10 text-fuchsia-400 font-semibold rounded hover:bg-fuchsia-500/20 transition-colors"
                      >
                        + Add Button
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(digitalSettings.buttons || []).map((btn: any, index: number) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <div className="flex-1">
                            <label className="text-xs text-slate-400 block mb-1">Button Label</label>
                            <input 
                              type="text" 
                              value={btn.label}
                              onChange={(e) => {
                                const newBtns = [...(digitalSettings.buttons || [])];
                                newBtns[index].label = e.target.value;
                                setDigitalSettings({ ...digitalSettings, buttons: newBtns });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg text-sm px-3 py-2 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" 
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-slate-400 block mb-1">Link to Secret Page</label>
                            <select 
                              value={btn.page_id}
                              onChange={(e) => {
                                const newBtns = [...(digitalSettings.buttons || [])];
                                newBtns[index].page_id = e.target.value;
                                setDigitalSettings({ ...digitalSettings, buttons: newBtns });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg text-sm px-3 py-2 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            >
                              <option value="">Select a page...</option>
                              {posts.filter(p => p.is_custom_page).map(page => (
                                <option key={page.id} value={page.id}>{page.title}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newBtns = [...(digitalSettings.buttons || [])];
                              newBtns.splice(index, 1);
                              setDigitalSettings({ ...digitalSettings, buttons: newBtns });
                            }}
                            className="mt-6 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg"
                            title="Remove Button"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        )}
      </div>

      {/* Interactive SEO Guide Modal */}
      {activeGuideModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveGuideModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="pr-8">
                <h3 className="text-base font-bold text-white leading-snug">{activeGuideModal.title}</h3>
                <p className="text-xs text-indigo-300 mt-0.5">{activeGuideModal.subtitle}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              {/* Why needed */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  🎯 কেন এটি পূরণ করবেন?
                </span>
                <p className="leading-relaxed text-slate-300">{activeGuideModal.whyNeeded}</p>
              </div>

              {/* How to write */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  ✍️ কীভাবে লিখবেন?
                </span>
                <p className="leading-relaxed text-slate-300 whitespace-pre-line">{activeGuideModal.howToWrite}</p>
              </div>

              {/* Examples */}
              {activeGuideModal.examples && activeGuideModal.examples.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    🌟 বাস্তব উদাহরণ (Examples)
                  </span>
                  <div className="space-y-1">
                    {activeGuideModal.examples.map((ex, i) => (
                      <div key={i} className="p-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-200">
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-[11px] leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong>প্রো-টিপস:</strong> {activeGuideModal.tips}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveGuideModal(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              বুঝেছি, ধন্যবাদ!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
