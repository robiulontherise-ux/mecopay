import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

pattern = r"""      views_count: editingPost\?\.views_count \|\| 1,
      is_custom_page: isCustomPage,
    \};"""

new_pattern = """      views_count: editingPost?.views_count || 1,
      is_custom_page: isCustomPage,
      show_details_btn: showDetailsBtn,
      show_share_btn: showShareBtn,
      show_thumbnail: showThumbnail,
      show_full_post: showFullPost,
    };"""

text = re.sub(pattern, new_pattern, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

