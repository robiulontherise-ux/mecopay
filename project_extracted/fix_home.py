import re

with open('src/components/Home.tsx', 'r') as f:
    text = f.read()

text = re.sub(r' \|\| post\.summary\.toLowerCase\(\)\.includes\(query\)', '', text)
text = re.sub(r' \|\| \(post\.tags && post\.tags\.some\(t => t\.toLowerCase\(\)\.includes\(query\)\)\)', '', text)

text = re.sub(r'                    \{post\.is_paid \? \(\n.*?\) : null\}\n', '', text, flags=re.DOTALL)
text = re.sub(r'                  \{post\.is_paid && \(.*?\)\}\n', '', text, flags=re.DOTALL)
text = re.sub(r'                  \{post\.exam_title && \(.*?\)\}\n', '', text, flags=re.DOTALL)

text = re.sub(r'                \{post\.summary && \(.*?\{post\.summary\}.*?<\/p>\n                \)\}\n', '', text, flags=re.DOTALL)
text = re.sub(r'                  \{post\.author && \(.*?\{post\.author\}.*?<\/span>\n                  \)\}\n', '', text, flags=re.DOTALL)


with open('src/components/Home.tsx', 'w') as f:
    f.write(text)

