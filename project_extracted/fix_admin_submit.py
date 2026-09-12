import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

save_regex = r"""    const newOrUpdatedPost: Post = \{
      id: editingPost\?\.id \|\| `post_\$\{Date\.now\(\)\}`,
      title: postTitle\.trim\(\),
      slug: postSlug\.trim\(\) \|\| `post-\$\{Date\.now\(\)\}`,
      content: isLiveCode 
        \? \(codeLanguage === 'live_html' \? `<!-- LIVE_CODE -->\\n\$\{postContent\}` : `<!-- CODE:\$\{codeLanguage\} -->\\n\$\{postContent\}`\)
        : postContent,
      category_id: postCategory \|\| categories\[0\]\?\.id \|\| 'cat-buet-eng',
      thumbnail: postThumbnail\.trim\(\) \|\| 'https://images\.unsplash\.com/photo-1635070041078-e363dbe005cb\?auto=format&fit=crop&w=1200&q=80',
      created_at: editingPost\?\.created_at \|\| new Date\(\)\.toISOString\(\),
      updated_at: new Date\(\)\.toISOString\(\),
      views_count: editingPost\?\.views_count \|\| 1,
    \};"""

save_replacement = """    const newOrUpdatedPost: Post = {
      id: editingPost?.id || `post_${Date.now()}`,
      title: postTitle.trim(),
      slug: postSlug.trim() || `post-${Date.now()}`,
      content: postContent,
      category_id: postCategory || categories[0]?.id || 'cat-buet-eng',
      thumbnail: postThumbnail.trim() || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
      created_at: editingPost?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views_count: editingPost?.views_count || 1,
      format_type: isLiveCode ? 'code' : 'standard',
      code_language: isLiveCode ? codeLanguage : undefined,
    };"""

text = re.sub(save_regex, save_replacement, text)

# Also fix the `handleEditPost` loading part
edit_load_regex = r"""    if \(post\.content\?\.startsWith\('<!-- LIVE_CODE -->'\)\) \{
      setIsLiveCode\(true\);
      setCodeLanguage\('live_html'\);
    \} else if \(post\.content\?\.startsWith\('<!-- CODE:'\)\) \{
      setIsLiveCode\(true\);
      const lang = post\.content\.split\('-->'\)\[0\]\.replace\('<!-- CODE:', ''\)\.trim\(\);
      setCodeLanguage\(lang\);
    \} else \{
      setIsLiveCode\(false\);
      setCodeLanguage\('live_html'\);
    \}

    if \(post\.content\?\.startsWith\('<!-- LIVE_CODE -->\\n'\)\) \{
      setPostContent\(post\.content\.replace\('<!-- LIVE_CODE -->\\n', ''\)\);
    \} else if \(post\.content\?\.startsWith\('<!-- CODE:'\)\) \{
      const parts = post\.content\.split\('-->\\n'\);
      setPostContent\(parts\.length > 1 \? parts\.slice\(1\)\.join\('-->\\n'\) : post\.content\);
    \} else \{
      setPostContent\(post\.content \|\| ''\);
    \}"""

edit_load_replacement = """    setIsLiveCode(post.format_type === 'code');
    setCodeLanguage(post.code_language || 'live_html');
    setPostContent(post.content || '');"""

text = re.sub(edit_load_regex, edit_load_replacement, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)
