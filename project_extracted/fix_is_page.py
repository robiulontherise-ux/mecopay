import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

old_str = """  const handleStartNewPost = (isPage = false) => {
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

new_str = """  const handleStartNewPost = (isPage = false) => {
    setEditingPost(null);
    setPostTitle('');
    setPostSlug('');
    setPostCategory(categories[0]?.id || '');
    setPostThumbnail('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80');
    setShowDetailsBtn(true);
    setShowShareBtn(true);
    setShowThumbnail(true);
    setShowFullPost(false);
    setIsCustomPage(isPage);"""

text = text.replace(old_str, new_str)

# In handleSavePostForm we also need to include is_custom_page in newOrUpdatedPost
save_old = """      category_id: postCategory || categories[0]?.id || 'cat-ssc',
      thumbnail: postThumbnail.trim() || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
      created_at: editingPost?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views_count: editingPost?.views_count || 1,
    };"""

save_new = """      category_id: postCategory || categories[0]?.id || 'cat-ssc',
      thumbnail: postThumbnail.trim() || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
      created_at: editingPost?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views_count: editingPost?.views_count || 1,
      is_custom_page: isCustomPage,
    };"""
text = text.replace(save_old, save_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

