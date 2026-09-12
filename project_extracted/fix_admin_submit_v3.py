with open('src/components/AdminPanel.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "const newOrUpdatedPost: Post = {" in line:
        skip = True
        new_lines.append(line)
        new_lines.append("      id: editingPost?.id || `post_${Date.now()}`,\n")
        new_lines.append("      title: postTitle.trim(),\n")
        new_lines.append("      slug: postSlug.trim() || `post-${Date.now()}`,\n")
        new_lines.append("      content: postContent,\n")
        new_lines.append("      category_id: postCategory || categories[0]?.id || 'cat-buet-eng',\n")
        new_lines.append("      thumbnail: postThumbnail.trim() || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',\n")
        new_lines.append("      created_at: editingPost?.created_at || new Date().toISOString(),\n")
        new_lines.append("      updated_at: new Date().toISOString(),\n")
        new_lines.append("      views_count: editingPost?.views_count || 1,\n")
        new_lines.append("      format_type: isLiveCode ? 'code' : 'standard',\n")
        new_lines.append("      code_language: isLiveCode ? codeLanguage : undefined,\n")
        new_lines.append("    };\n")
    elif skip and "    };" in line:
        skip = False
    elif not skip:
        new_lines.append(line)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.writelines(new_lines)
