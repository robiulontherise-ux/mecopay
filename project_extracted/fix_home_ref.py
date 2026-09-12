import re

with open('src/components/Home.tsx', 'r') as f:
    text = f.read()

# Make sure useRef is imported
if 'useRef' not in text:
    text = text.replace("import React, {", "import React, { useRef,")

# Make sure iframeRef is defined inside the component
if 'const iframeRef =' not in text:
    # Find the start of the component body
    body_start = text.find('const Home: React.FC<HomeProps> = ({')
    if body_start != -1:
        # Find the opening brace of the component body
        brace_idx = text.find(') => {', body_start)
        if brace_idx != -1:
            insertion_point = brace_idx + 6
            text = text[:insertion_point] + "\n  const iframeRef = useRef<HTMLIFrameElement>(null);\n" + text[insertion_point:]

with open('src/components/Home.tsx', 'w') as f:
    f.write(text)
