import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Let's just do simple replacements
text = text.replace("import { INITIAL_CATEGORIES, INITIAL_POSTS } from './data/initialData';", "")
text = text.replace("const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);", "const [categories, setCategories] = useState<Category[]>([]);")
text = text.replace("const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);", "const [posts, setPosts] = useState<Post[]>([]);")

fetch_func = """  const fetchSupabaseData = useCallback(async () => {
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

# Find the old fetchSupabaseData block and replace it
import ast
# easier to just use regex since we know roughly where it starts and ends
text = re.sub(r'  const fetchSupabaseData = useCallback\(async \(\) => \{.*?  \}, \[\]\);', fetch_func, text, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(text)
