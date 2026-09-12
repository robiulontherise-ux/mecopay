import re

# Fix AdminPanel
with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

paid = r"""                          \{post\.is_paid \? \(
                            <span className="text-\[10px\] font-bold px-2 py-0\.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              PAID \(৳\{post\.price\}\)
                            <\/span>
                          \) : \(
                            <span className="text-\[10px\] font-medium px-2 py-0\.5 rounded bg-slate-800 text-slate-300">
                              FREE
                            <\/span>
                          \)\}"""
text = re.sub(paid, '', text, flags=re.DOTALL)
text = re.sub(r'<p className="text-xs text-slate-400 line-clamp-1 mt-0\.5">\{post\.summary\}<\/p>', '', text)
with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

# Fix App
with open('src/App.tsx', 'r') as f:
    text = f.read()
# Just remove anything after LazyAuthModal closing tag until </div>  );
text = re.sub(r'      />\n      \{/\* Buy Volume & Checkout Modal \*/\}.*?    <\/div>\n  \);\n\}', '      />\n    </div>\n  );\n}', text, flags=re.DOTALL)
with open('src/App.tsx', 'w') as f:
    f.write(text)

# Fix Home
with open('src/components/Home.tsx', 'r') as f:
    text = f.read()
text = re.sub(r'                    \{post\.is_paid \? \(\n.*?\) : null\}\n', '', text, flags=re.DOTALL)
text = re.sub(r'                  \{post\.is_paid && \(.*?\)\}\n', '', text, flags=re.DOTALL)
text = re.sub(r'post\.is_paid \? \'bg-amber.*?Free Access\'\}', '', text, flags=re.DOTALL)
# wait, my regex earlier removed the tags, let's see what's actually there
