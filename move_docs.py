import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

# First find the block starting with `<div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">`
# and ending before `if (activeSubMenu === 'Webhook Settings') {`
# We'll extract it and replace it with empty.

docs_start_str = '<div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">'
# There are two <div className="mt-8 bg-slate-900/50... in the file maybe, let's search for "Developer Documentation"
docs_h3 = '<h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Book className="w-5 h-5 text-blue-400" /> Developer Documentation</h3>'

idx_h3 = content.find(docs_h3)
if idx_h3 != -1:
    idx_start = content.rfind(docs_start_str, 0, idx_h3)
    if idx_start != -1:
        # Find the end of this div block.
        # we can just use regular expressions or string matching to `         </div>\n       )\n    }\n\n    if (activeSubMenu === 'Webhook Settings') {`
        end_str = '         </div>\n       )\n    }\n\n    if (activeSubMenu === \'Webhook Settings\') {'
        idx_end = content.find(end_str, idx_start)
        if idx_end != -1:
            extracted_docs = content[idx_start:idx_end]
            
            # replace in the old place
            content = content[:idx_start] + content[idx_end:]
            
            # Now, where to insert it for 'Developer Docs'?
            # Let's insert it after `if (activeSubMenu === 'SEO Settings') { ... }` or before it.
            # let's find `if (activeSubMenu === 'Manage Posts') {`
            
            # wait, let's just add a new branch
            new_branch = f"""
    if (activeSubMenu === 'Developer Docs') {{
      return (
        <div className="max-w-4xl mx-auto">
          {extracted_docs}
        </div>
      );
    }}
"""
            
            manage_posts_idx = content.find("if (activeSubMenu === 'Manage Posts') {")
            if manage_posts_idx != -1:
                content = content[:manage_posts_idx] + new_branch + content[manage_posts_idx:]
                with open('src/components/DashboardShell.tsx', 'w') as f:
                    f.write(content)
                print("Successfully moved Developer Docs.")
            else:
                print("Manage Posts not found.")
        else:
            print("End string not found.")
    else:
        print("Start div not found.")
else:
    print("H3 not found.")
