import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

pattern = r"""  const handleEditPost = \(p: Post\) => \{
    setEditingPost\(p\);
    setPostTitle\(p\.title\);
    setPostSlug\(p\.slug\);
    setPostCategory\(p\.category_id\);
    setPostThumbnail\(p\.thumbnail\);
    setPostContent\(p\.content\);
    setActiveTab\('edit-post'\);
  \};"""

new_pattern = """  const handleEditPost = (p: Post) => {
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
  };"""

text = re.sub(pattern, new_pattern, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

