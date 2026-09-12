import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

save_old = """  const handleSavePost = async (post: Post) => {
    try {
      const { error } = await supabase.from('posts').upsert([post]);
      if (error) {
        console.error('Supabase save error:', error.message);
        alert(`Database Error: ${error.message}\\n(Check if Row Level Security is blocking inserts)`);
        return;
      }
    } catch (err) {
      console.warn('Supabase posts error:', err);
    }"""
    
save_new = """  const handleSavePost = async (post: Post) => {
    try {
      const { error } = await supabase.from('posts').upsert([post]);
      if (error) {
        console.error('Supabase save error:', error.message);
        if (error.message.includes('does not exist')) {
          alert(`Supabase Error: You need to add the new custom settings columns to your posts table!\\n\\nPlease go to Supabase Dashboard -> SQL Editor and run:\\n\\nALTER TABLE posts \\nADD COLUMN show_details_btn BOOLEAN DEFAULT true,\\nADD COLUMN show_share_btn BOOLEAN DEFAULT true,\\nADD COLUMN show_thumbnail BOOLEAN DEFAULT true,\\nADD COLUMN show_full_post BOOLEAN DEFAULT false,\\nADD COLUMN is_custom_page BOOLEAN DEFAULT false;`);
        } else {
          alert(`Database Error: ${error.message}\\n(Check if Row Level Security is blocking inserts)`);
        }
        return;
      }
    } catch (err) {
      console.warn('Supabase posts error:', err);
    }"""

text = text.replace(save_old, save_new)

with open('src/App.tsx', 'w') as f:
    f.write(text)

