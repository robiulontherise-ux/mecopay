import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

state_old = """  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('BookOpen');
  const [catOrder, setCatOrder] = useState(0);"""

state_new = """  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('BookOpen');
  const [catOrder, setCatOrder] = useState(0);
  const [catParentId, setCatParentId] = useState<string | null>(null);"""

text = text.replace(state_old, state_new)

edit_cat_old = """      setCatName(cat.name);
      setCatSlug(cat.slug);
      setCatDesc(cat.description || '');
      setCatIcon(cat.icon_name || 'BookOpen');
      setCatOrder(cat.order_index);"""

edit_cat_new = """      setCatName(cat.name);
      setCatSlug(cat.slug);
      setCatDesc(cat.description || '');
      setCatIcon(cat.icon_name || 'BookOpen');
      setCatOrder(cat.order_index);
      setCatParentId(cat.parent_id || null);"""

text = text.replace(edit_cat_old, edit_cat_new)

save_cat_old = """      description: catDesc,
      icon_name: catIcon,
      order_index: catOrder,
    };"""

save_cat_new = """      description: catDesc,
      icon_name: catIcon,
      order_index: catOrder,
      parent_id: catParentId || null,
    };"""

text = text.replace(save_cat_old, save_cat_new)

reset_cat_old = """    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatIcon('BookOpen');
    setCatOrder(categories.length);"""

reset_cat_new = """    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatIcon('BookOpen');
    setCatOrder(categories.length);
    setCatParentId(null);"""

text = text.replace(reset_cat_old, reset_cat_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

