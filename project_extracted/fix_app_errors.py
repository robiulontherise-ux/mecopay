import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Make it alert on error
err_regex = r"      if \(error\) \{\n        console\.warn\('Could not upsert to Supabase directly, updating local state:', error\.message\);\n      \}"
err_replacement = """      if (error) {
        console.error('Supabase save error:', error.message);
        alert(`Database Error: ${error.message}\\n(Check if Row Level Security is blocking inserts)`);
        return;
      }"""
text = re.sub(err_regex, err_replacement, text)

err2_regex = r"      if \(error\) \{\n        console\.warn\('Could not upsert post to Supabase, updating local state:', error\.message\);\n      \}"
err2_replacement = """      if (error) {
        console.error('Supabase save error:', error.message);
        alert(`Database Error: ${error.message}\\n(Check if Row Level Security is blocking inserts)`);
        return;
      }"""
text = re.sub(err2_regex, err2_replacement, text)

# Delete category alert
del_err_regex = r"      if \(error\) console\.error\('Error deleting category:', error\);"
del_err_replacement = """      if (error) {
        alert('Database Error: ' + error.message);
        return;
      }"""
text = re.sub(del_err_regex, del_err_replacement, text)

del_post_err_regex = r"      if \(error\) console\.error\('Error deleting post:', error\);"
del_post_err_replacement = """      if (error) {
        alert('Database Error: ' + error.message);
        return;
      }"""
text = re.sub(del_post_err_regex, del_post_err_replacement, text)


with open('src/App.tsx', 'w') as f:
    f.write(text)

