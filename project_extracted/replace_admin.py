import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

# State removals
content = re.sub(r"  const \[postTelegram, setPostTelegram\] = useState\('.*?'\);\n", "", content)
content = re.sub(r"  const \[postIsPaid, setPostIsPaid\] = useState\(.*?\);\n", "", content)
content = re.sub(r"  const \[postPrice, setPostPrice\] = useState\(.*?\);\n", "", content)
content = re.sub(r"  const \[postExamTitle, setPostExamTitle\] = useState\('.*?'\);\n", "", content)
content = re.sub(r"  const \[postExamUrl, setPostExamUrl\] = useState\('.*?'\);\n", "", content)
content = re.sub(r"  const \[postDuration, setPostDuration\] = useState\(.*?\);\n", "", content)
content = re.sub(r"  const \[postSummary, setPostSummary\] = useState\('.*?'\);\n", "", content)
content = re.sub(r"  const \[postAuthor, setPostAuthor\] = useState\('.*?'\);\n", "", content)

# handleStartNewPost resets
content = re.sub(r"    setPostTelegram\('.*?'\);\n", "", content)
content = re.sub(r"    setPostIsPaid\(.*?\);\n", "", content)
content = re.sub(r"    setPostPrice\(.*?\);\n", "", content)
content = re.sub(r"    setPostExamTitle\('.*?'\);\n", "", content)
content = re.sub(r"    setPostExamUrl\('.*?'\);\n", "", content)
content = re.sub(r"    setPostDuration\(.*?\);\n", "", content)
content = re.sub(r"    setPostSummary\('.*?'\);\n", "", content)
content = re.sub(r"    setPostAuthor\('.*?'\);\n", "", content)

# handleEditPost assignments
content = re.sub(r"    setPostTelegram\(p\.telegram_link \|\| ''\);\n", "", content)
content = re.sub(r"    setPostIsPaid\(p\.is_paid\);\n", "", content)
content = re.sub(r"    setPostPrice\(p\.price \|\| 0\);\n", "", content)
content = re.sub(r"    setPostExamTitle\(p\.exam_title \|\| ''\);\n", "", content)
content = re.sub(r"    setPostExamUrl\(p\.exam_url \|\| ''\);\n", "", content)
content = re.sub(r"    setPostDuration\(p\.duration_minutes \|\| 30\);\n", "", content)
content = re.sub(r"    setPostSummary\(p\.summary \|\| ''\);\n", "", content)
content = re.sub(r"    setPostAuthor\(p\.author \|\| 'BUET DMC Dreamers Team'\);\n", "", content)

# newOrUpdatedPost properties
content = re.sub(r"      telegram_link: postTelegram.*?\n", "", content)
content = re.sub(r"      is_paid: postIsPaid,\n", "", content)
content = re.sub(r"      price: postIsPaid \? Number\(postPrice\) : 0,\n", "", content)
content = re.sub(r"      exam_title: postExamTitle.*?\n", "", content)
content = re.sub(r"      exam_url: postExamUrl.*?\n", "", content)
content = re.sub(r"      duration_minutes: Number\(postDuration\),\n", "", content)
content = re.sub(r"      summary: postSummary.*?\n", "", content)
content = re.sub(r"      author: postAuthor.*?\n", "", content)

# JSX removals
# The telegram div:
telegram_block = r"""              <div>\s*<label className="block text-xs font-medium text-slate-300 mb-1">Telegram Community Link</label>\s*<input\s*type="url"\s*placeholder="https://t\.me/..."\s*value={postTelegram}\s*onChange={\(e\) => setPostTelegram\(e\.target\.value\)}\s*className="w-full px-3\.5 py-2\.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"\s*/>\s*</div>"""
content = re.sub(telegram_block, "", content, flags=re.DOTALL)

# Change grid md:grid-cols-3 to md:grid-cols-2
content = content.replace('<div className="grid md:grid-cols-3 gap-4">', '<div className="grid md:grid-cols-2 gap-4">')

# Paid / Volume Settings block:
paid_block = r"""            \{\/\* Paid \/ Volume Settings \*\/.*?<\/div>"""
content = re.sub(r"            \{\/\* Paid \/ Volume Settings \*\/.*?<\/div>\n", "", content, flags=re.DOTALL)

# Let's write a stricter regex for the Paid and Summary blocks
paid_block_exact = r"""            \{\/\* Paid \/ Volume Settings \*\/\}.*?            \{\/\* Summary \*\/\}.*?<\/div>"""
content = re.sub(paid_block_exact, "", content, flags=re.DOTALL)


with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)
