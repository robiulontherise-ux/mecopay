import re

file_path = 'src/components/DashboardShell.tsx'
with open(file_path, 'r') as f:
    code = f.read()

start_str = "if (activeSubMenu === 'Website Builder') {"
start_idx = code.find(start_str)

if start_idx != -1:
    # Find the next `if (activeSubMenu ===` after this one
    end_idx = code.find("if (activeSubMenu ===", start_idx + len(start_str))
    
    if end_idx != -1:
        # Reconstruct
        # Wait, there might be some closing braces before end_idx. 
        # Let's just do a simple replacement for the text up to `if (activeSubMenu === 'Analytics') {`
        # Because we saw that was the next one.
        end_idx2 = code.find("if (activeSubMenu === 'Analytics') {", start_idx)
        if end_idx2 != -1:
            new_block = "if (activeSubMenu === 'Website Builder') {\n      return (\n        <div className=\"h-[calc(100vh-100px)] overflow-y-auto w-full -mx-4 sm:mx-0 bg-slate-950 rounded-xl\">\n          <MySiteApp />\n        </div>\n      );\n    }\n\n    "
            code = code[:start_idx] + new_block + code[end_idx2:]

with open(file_path, 'w') as f:
    f.write(code)

print("DashboardShell updated 2.")
