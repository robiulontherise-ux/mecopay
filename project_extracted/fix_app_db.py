import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# 1. Remove initial fallback states
text = re.sub(r'const \[categories, setCategories\] = useState<Category\[\]>\(INITIAL_CATEGORIES\);', 'const [categories, setCategories] = useState<Category[]>([]);', text)
text = re.sub(r'const \[posts, setPosts\] = useState<Post\[\]>\(INITIAL_POSTS\);', 'const [posts, setPosts] = useState<Post[]>([]);', text)
text = re.sub(r"import \{ INITIAL_CATEGORIES, INITIAL_POSTS \} from '\./data/initialData';\n", "", text)

# 2. Fix fetchSupabaseData
fetch_func = r"""  const fetchSupabaseData = useCallback\(async \(\) => \{
    try \{
      // 1\. Fetch Categories
      const \{ data: catData, error: catErr \} = await supabase
        \.from\('categories'\)
        \.select\('\*'\)
        \.order\('order_index', \{ ascending: true \}\);

      if \(\!catErr && catData && catData\.length > 0\) \{
        setCategories\(catData\);
      \} else \{
        // Fallback to local storage or initial
        const savedCats = localStorage\.getItem\('custom_categories'\);
        if \(savedCats\) \{
          setCategories\(JSON\.parse\(savedCats\)\);
        \}
      \}

      // 2\. Fetch Posts
      const \{ data: postData, error: postErr \} = await supabase
        \.from\('posts'\)
        \.select\('\*'\)
        \.order\('created_at', \{ ascending: false \}\);

      if \(\!postErr && postData && postData\.length > 0\) \{
        setPosts\(postData\);
      \} else \{
        const savedPosts = localStorage\.getItem\('custom_posts'\);
        if \(savedPosts\) \{
          setPosts\(JSON\.parse\(savedPosts\)\);
        \}
      \}
    \} catch \(err\) \{
      console\.warn\('Error fetching from Supabase', err\);
    \}
  \}, \[\]\);"""

new_fetch_func = """  const fetchSupabaseData = useCallback(async () => {
    try {
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });
      if (!catErr && catData) {
        setCategories(catData);
      }

      const { data: postData, error: postErr } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!postErr && postData) {
        setPosts(postData);
      }
    } catch (err) {
      console.warn('Error fetching from Supabase', err);
    }
  }, []);"""

text = re.sub(fetch_func, new_fetch_func, text, flags=re.DOTALL)

# 3. Remove localStorage from handleSaveCategory
save_cat = r"""    // 2\. Update React State
    setCategories\(\(prev\) => \{
      const idx = prev\.findIndex\(\(c\) => c\.id === cat\.id\);
      let updated;
      if \(idx >= 0\) \{
        updated = \[\.\.\.prev\];
        updated\[idx\] = cat;
      \} else \{
        updated = \[\.\.\.prev, cat\];
      \}
      updated\.sort\(\(a, b\) => a\.order_index - b\.order_index\);
      localStorage\.setItem\('custom_categories', JSON\.stringify\(updated\)\);
      return updated;
    \}\);"""

new_save_cat = """    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === cat.id);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = cat;
      } else {
        updated = [...prev, cat];
      }
      updated.sort((a, b) => a.order_index - b.order_index);
      return updated;
    });"""
text = re.sub(save_cat, new_save_cat, text, flags=re.DOTALL)

# 4. Remove localStorage from handleDeleteCategory
del_cat = r"""    setCategories\(\(prev\) => \{
      const updated = prev\.filter\(\(c\) => c\.id !== catId\);
      localStorage\.setItem\('custom_categories', JSON\.stringify\(updated\)\);
      return updated;
    \}\);"""
new_del_cat = """    setCategories((prev) => prev.filter((c) => c.id !== catId));"""
text = re.sub(del_cat, new_del_cat, text, flags=re.DOTALL)


# 5. Remove localStorage from handleSavePost
save_post = r"""    setPosts\(\(prev\) => \{
      const idx = prev\.findIndex\(\(p\) => p\.id === post\.id\);
      let updated;
      if \(idx >= 0\) \{
        updated = \[\.\.\.prev\];
        updated\[idx\] = post;
      \} else \{
        updated = \[post, \.\.\.prev\];
      \}
      localStorage\.setItem\('custom_posts', JSON\.stringify\(updated\)\);
      return updated;
    \}\);"""
new_save_post = """    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === post.id);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = post;
      } else {
        updated = [post, ...prev];
      }
      return updated;
    });"""
text = re.sub(save_post, new_save_post, text, flags=re.DOTALL)


# 6. Remove localStorage from handleDeletePost
del_post = r"""    setPosts\(\(prev\) => \{
      const updated = prev\.filter\(\(p\) => p\.id !== postId\);
      localStorage\.setItem\('custom_posts', JSON\.stringify\(updated\)\);
      return updated;
    \}\);"""
new_del_post = """    setPosts((prev) => prev.filter((p) => p.id !== postId));"""
text = re.sub(del_post, new_del_post, text, flags=re.DOTALL)


with open('src/App.tsx', 'w') as f:
    f.write(text)

