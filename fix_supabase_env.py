import re

with open('src/lib/supabase.ts', 'r') as f:
    content = f.read()

content = content.replace("import.meta.env", "(import.meta as any).env")

with open('src/lib/supabase.ts', 'w') as f:
    f.write(content)
print("Fixed supabase env")
