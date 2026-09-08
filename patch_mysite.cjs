const fs = require('fs');
let code = fs.readFileSync('src/mysite/App.tsx', 'utf8');

// 1. Remove Auth State and Effects
code = code.replace(/const \[user, setUser\] = useState<any>\(null\);/g, 'const user = { email: ADMIN_EMAIL, user_metadata: { full_name: "Super Admin" } };');
code = code.replace(/const \[authLoading, setAuthLoading\] = useState\(true\);/g, '');

code = code.replace(/useEffect\(\(\) => \{\s*\/\/\s*Check real Supabase session[\s\S]*?return \(\) => subscription\.unsubscribe\(\);\s*\}, \[\]\);/g, '');

// 2. Remove Auth Modal State and references
code = code.replace(/const \[authModalOpen, setAuthModalOpen\] = useState\(false\);/g, '');
code = code.replace(/const \[authModalContext, setAuthModalContext\] = useState<string>\('navbar'\);/g, '');
code = code.replace(/const handleSuccessLogin = [\s\S]*?setUser\(newUser\);\s*\n\s*\n\s*\};/g, '');

code = code.replace(/<LazyAuthModal[\s\S]*?\/>/g, '');
code = code.replace(/import LazyAuthModal from '\.\/components\/LazyAuthModal';/g, '');
code = code.replace(/onOpenAuthModal=\{\(\) => \{[\s\S]*?\}\}/g, '');
code = code.replace(/onOpenAuthModal=\{\(ctx\) => \{[\s\S]*?\}\}/g, '');

fs.writeFileSync('src/mysite/App.tsx', code);
console.log("Patched mysite/App.tsx");
