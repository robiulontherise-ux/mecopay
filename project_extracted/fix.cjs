const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const regex = /if \(uploadError\.message\.includes\('row-level security policy'\)\) \{[\s\S]*?\}/g;

const replacement = `if (uploadError.message.includes('row-level security policy')) {
          alert("Supabase Storage Error: Your Supabase database is blocking image uploads because Row Level Security (RLS) is enabled.\\n\\nPlease go to your Supabase Dashboard -> SQL Editor and run this query:\\n\\nCREATE POLICY \\"Allow public uploads\\" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'potimg');");
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
