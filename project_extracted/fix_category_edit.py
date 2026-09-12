import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

edit_old = """                      onClick={() => {
                        setEditingCategory(cat);
                        setCatName(cat.name);
                        setCatSlug(cat.slug);
                        setCatOrder(cat.order_index);
                        setCatDesc(cat.description || '');
                      }}"""

edit_new = """                      onClick={() => {
                        setEditingCategory(cat);
                        setCatName(cat.name);
                        setCatSlug(cat.slug);
                        setCatOrder(cat.order_index);
                        setCatDesc(cat.description || '');
                        setCatParentId(cat.parent_id || null);
                      }}"""

text = text.replace(edit_old, edit_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

