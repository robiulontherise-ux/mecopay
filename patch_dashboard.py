import re

file_path = 'src/components/DashboardShell.tsx'
with open(file_path, 'r') as f:
    code = f.read()

# 1. Replace the menu item string
code = code.replace("'Landing Page Builder'", "'Website Builder'")
code = code.replace("activeSubMenu === 'Landing Page Builder'", "activeSubMenu === 'Website Builder'")

# 2. Add import for MySiteApp
if "import MySiteApp" not in code:
    code = code.replace("import React, { useState, useEffect, useRef } from 'react';", 
                        "import React, { useState, useEffect, useRef } from 'react';\nimport MySiteApp from '../mysite/App';")
    code = code.replace("import React, { useState, useEffect } from 'react';",
                        "import React, { useState, useEffect } from 'react';\nimport MySiteApp from '../mysite/App';")

# 3. Replace the block for activeSubMenu === 'Website Builder'
# The block starts at `if (activeSubMenu === 'Website Builder') {` and ends before the next `if (activeSubMenu === 'Manage Posts') {` or similar.
# A regex can be used, but since it's tricky, we can find the indices.

start_idx = code.find("if (activeSubMenu === 'Website Builder') {")
if start_idx != -1:
    end_idx = code.find("if (activeSubMenu === 'Manage Posts') {", start_idx)
    if end_idx != -1:
        # Reconstruct
        new_block = "if (activeSubMenu === 'Website Builder') {\n      return (\n        <div className=\"h-[calc(100vh-80px)] overflow-y-auto w-full -mx-4 sm:mx-0\">\n          <MySiteApp />\n        </div>\n      );\n    }\n\n    "
        code = code[:start_idx] + new_block + code[end_idx:]

with open(file_path, 'w') as f:
    f.write(code)

print("DashboardShell updated.")
