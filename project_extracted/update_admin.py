import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Add states for the new settings
state_add = """  const [postTitle, setPostTitle] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [postThumbnail, setPostThumbnail] = useState('');
  
  // Custom Display Options
  const [showDetailsBtn, setShowDetailsBtn] = useState(true);
  const [showShareBtn, setShowShareBtn] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [showFullPost, setShowFullPost] = useState(false);
  const [isCustomPage, setIsCustomPage] = useState(false);"""

text = re.sub(
    r"  const \[postTitle, setPostTitle\] = useState\(''\);\n  const \[postSlug, setPostSlug\] = useState\(''\);\n  const \[postCategory, setPostCategory\] = useState\(''\);\n  const \[postThumbnail, setPostThumbnail\] = useState\(''\);",
    state_add,
    text
)

# Initialize them in handleStartNewPost
init_new = """  const handleStartNewPost = () => {
    setEditingPost(null);
    setPostTitle('');
    setPostSlug('');
    setPostCategory(categories[0]?.id || '');
    setPostThumbnail('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80');
    setShowDetailsBtn(true);
    setShowShareBtn(true);
    setShowThumbnail(true);
    setShowFullPost(false);
    setIsCustomPage(false);"""

text = re.sub(
    r"  const handleStartNewPost = \(\) => \{\n    setEditingPost\(null\);\n    setPostTitle\(''\);\n    setPostSlug\(''\);\n    setPostCategory\(categories\[0\]\?\.id \|\| ''\);\n    setPostThumbnail\('https://images\.unsplash\.com/[^']+'\);",
    init_new,
    text
)

# Load them in handleEditPost
edit_new = """  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPostTitle(post.title);
    setPostSlug(post.slug);
    setPostCategory(post.category_id);
    setPostThumbnail(post.thumbnail || '');
    setPostContent(post.content);
    setIsLiveCode(post.format_type === 'code');
    setCodeLanguage(post.code_language || 'live_html');
    
    setShowDetailsBtn(post.show_details_btn ?? true);
    setShowShareBtn(post.show_share_btn ?? true);
    setShowThumbnail(post.show_thumbnail ?? true);
    setShowFullPost(post.show_full_post ?? false);
    setIsCustomPage(post.is_custom_page ?? false);
    
    setActiveTab('edit-post');
  };"""

text = re.sub(
    r"  const handleEditPost = \(post: Post\) => \{\n    setEditingPost\(post\);\n    setPostTitle\(post\.title\);\n    setPostSlug\(post\.slug\);\n    setPostCategory\(post\.category_id\);\n    setPostThumbnail\(post\.thumbnail \|\| ''\);\n    setPostContent\(post\.content\);\n    setIsLiveCode\(post\.format_type === 'code'\);\n    setCodeLanguage\(post\.code_language \|\| 'live_html'\);\n    setActiveTab\('edit-post'\);\n  \};",
    edit_new,
    text
)

# Save them in handleSavePostForm
save_new = """    const newPost: Post = {
      id: editingPost ? editingPost.id : `post_${Date.now()}`,
      title: postTitle.trim(),
      slug: postSlug.trim() || `post-${Date.now()}`,
      content: postContent,
      category_id: postCategory,
      thumbnail: postThumbnail,
      created_at: editingPost ? editingPost.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      format_type: isLiveCode ? 'code' : 'standard',
      code_language: isLiveCode ? codeLanguage : undefined,
      show_details_btn: showDetailsBtn,
      show_share_btn: showShareBtn,
      show_thumbnail: showThumbnail,
      show_full_post: showFullPost,
      is_custom_page: isCustomPage,
    };"""

text = re.sub(
    r"    const newPost: Post = \{\n      id: editingPost \? editingPost\.id : `post_[\$\{Date\.now\(\)\}`]+`?,\n      title: postTitle\.trim\(\),\n      slug: postSlug\.trim\(\) \|\| `post-[\$\{Date\.now\(\)\}`]+`?,\n      content: postContent,\n      category_id: postCategory,\n      thumbnail: postThumbnail,\n      created_at: editingPost \? editingPost\.created_at : new Date\(\)\.toISOString\(\),\n      updated_at: new Date\(\)\.toISOString\(\),\n      format_type: isLiveCode \? 'code' : 'standard',\n      code_language: isLiveCode \? codeLanguage : undefined,\n    \};",
    save_new,
    text
)

# Insert the UI toggles into the form
# We will find the place right after the Thumbnail upload area
toggles_html = """              </div>

              {/* POST DISPLAY SETTINGS */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                <h3 className="text-sm font-bold text-slate-200 mb-2">Display & Privacy Settings</h3>
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
                    <span className="text-xs text-slate-300">Show Full Content in List (No Truncation)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer sm:col-span-2 mt-2 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                    <input type="checkbox" checked={isCustomPage} onChange={(e) => setIsCustomPage(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                    <div>
                      <span className="text-xs font-bold text-indigo-300 block">Make this a Custom Hidden Page</span>
                      <span className="text-[10px] text-slate-400">If checked, this post will NOT show on the website. It can only be accessed directly via its link.</span>
                    </div>
                  </label>
                </div>
              </div>"""

text = re.sub(
    r"                  </div>\n                </div>\n              </div>\n\n              <div>",
    toggles_html + "\n\n              <div>",
    text
)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

