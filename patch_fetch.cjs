const fs = require('fs');
const file = '/app/applet/src/mysite/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// Modify fetchSupabaseData to depend on user.id and filter
code = code.replace(
  /const fetchSupabaseData = useCallback\(async \(\) => \{/,
  `const fetchSupabaseData = useCallback(async () => {\n    if (!user?.id) return;`
);

code = code.replace(
  /\.from\('categories'\)\s*\.select\('\*'\)/g,
  `.from('categories').select('*').eq('client_id', user.id)`
);

code = code.replace(
  /\.from\('posts'\)\s*\.select\('\*'\)/g,
  `.from('posts').select('*').eq('client_id', user.id)`
);

code = code.replace(
  /\.from\('site_settings'\)\s*\.select\('\*'\)/g,
  `.from('site_settings').select('*').eq('client_id', user.id)`
);

// We need to add user to the dependency array
code = code.replace(
  /\}, \[\]\);\s*\n\s*useEffect\(\(\) => \{/g,
  `}, [user?.id]);\n  useEffect(() => {`
);

// We need to add client_id when saving a category
code = code.replace(
  /const handleSaveCategory = async \(cat: Category\) => \{/,
  `const handleSaveCategory = async (cat: Category) => {\n    if (!user?.id) return alert('No client ID found (not logged in).');\n    cat.client_id = user.id;`
);

// We need to add client_id when saving a post
code = code.replace(
  /const handleSavePost = async \(post: Post\) => \{/,
  `const handleSavePost = async (post: Post) => {\n    if (!user?.id) return alert('No client ID found (not logged in).');\n    post.client_id = user.id;`
);

// We need to add client_id when saving settings
code = code.replace(
  /const handleSaveSettings = async \(settings: SiteSettings\) => \{/,
  `const handleSaveSettings = async (settings: SiteSettings) => {\n    if (!user?.id) return alert('No client ID found (not logged in).');\n    settings.client_id = user.id;`
);

fs.writeFileSync(file, code);
