with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

text = text.replace("import React, { useState, useEffect } from 'react';\\nimport ReactQuill from 'react-quill';\\nimport 'react-quill/dist/quill.snow.css';", "import React, { useState, useEffect } from 'react';\nimport ReactQuill from 'react-quill';\nimport 'react-quill/dist/quill.snow.css';")

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)
