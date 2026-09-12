import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Fix 1: Add catParentId state
state_old = """  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catOrder, setCatOrder] = useState(1);
  const [catDesc, setCatDesc] = useState('');"""

state_new = """  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catOrder, setCatOrder] = useState(1);
  const [catDesc, setCatDesc] = useState('');
  const [catParentId, setCatParentId] = useState<string | null>(null);"""

text = text.replace(state_old, state_new)

# Fix 2: handleEditPostClick -> handleEditPost
text = text.replace('handleEditPostClick', 'handleEditPost')

# Fix 3: handleDeletePostSubmit -> handleDeletePost
text = text.replace('handleDeletePostSubmit', 'handleDeletePost')

# Fix 4: handleEditCategoryClick -> handleEditCategory
# Wait, let's see if handleEditCategory exists. Let's just fix it.

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

