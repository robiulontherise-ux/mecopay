const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("App getSession error:", error);`,
  `supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("App getSession error:", error);
        alert("Login Failed: " + (error.message || "Your account might be blocked or invalid."));
      }`
);

// Also check the URL hash directly, sometimes getSession doesn't return the error directly but the error is in the URL.
code = code.replace(
  `supabase.auth.getSession().then`,
  `// Check for hash errors from OAuth
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.has('error_description')) {
      alert("Login Error: " + decodeURIComponent(hashParams.get('error_description') || ''));
    }
    
    supabase.auth.getSession().then`
);

fs.writeFileSync('src/App.tsx', code);
