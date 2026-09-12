with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Replace the save logic
import re

regex = r"""      content: isLiveCode 
        \? \(codeLanguage === 'live_html' \? `<!-- LIVE_CODE -->\\n\$\{postContent\}` : `<!-- CODE:\$\{codeLanguage\} -->\\n\$\{postContent\}`\)
        : postContent,"""
text = re.sub(regex, "      content: postContent,\n      format_type: isLiveCode ? 'code' : 'standard',\n      code_language: isLiveCode ? codeLanguage : undefined,", text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)
