const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `supabase.auth.getSession().then(({ data: { session } }) => {`,
  `supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("App getSession error:", error);`
);

code = code.replace(
  `} = supabase.auth.onAuthStateChange((_event, session) => {`,
  `} = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session ? "Session exists" : "No session");`
);

fs.writeFileSync('src/App.tsx', code);
