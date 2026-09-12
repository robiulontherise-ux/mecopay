import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Add code language state
state_regex = r"  const \[isLiveCode, setIsLiveCode\] = useState\(false\);"
state_replacement = """  const [isLiveCode, setIsLiveCode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('live_html');"""
text = re.sub(state_regex, state_replacement, text)

# Set state on edit
edit_regex = r"    setIsLiveCode\(post\.content\?\.startsWith\('<!-- LIVE_CODE -->'\) \|\| false\);"
edit_replacement = """    if (post.content?.startsWith('<!-- LIVE_CODE -->')) {
      setIsLiveCode(true);
      setCodeLanguage('live_html');
    } else if (post.content?.startsWith('<!-- CODE:')) {
      setIsLiveCode(true);
      const lang = post.content.split('-->')[0].replace('<!-- CODE:', '').trim();
      setCodeLanguage(lang);
    } else {
      setIsLiveCode(false);
      setCodeLanguage('live_html');
    }"""
text = re.sub(edit_regex, edit_replacement, text)

# Set content formatting on edit
content_edit_regex = r"    setPostContent\(post\.content \|\| ''\);"
content_edit_replacement = """    if (post.content?.startsWith('<!-- LIVE_CODE -->\\n')) {
      setPostContent(post.content.replace('<!-- LIVE_CODE -->\\n', ''));
    } else if (post.content?.startsWith('<!-- CODE:')) {
      const parts = post.content.split('-->\\n');
      setPostContent(parts.length > 1 ? parts.slice(1).join('-->\\n') : post.content);
    } else {
      setPostContent(post.content || '');
    }"""
text = re.sub(content_edit_regex, content_edit_replacement, text)


# Update save content logic
save_regex = r"      content: isLiveCode && !postContent\.startsWith\('<!-- LIVE_CODE -->'\) \? `<!-- LIVE_CODE -->\\n\$\{postContent\}` : \(\!isLiveCode && postContent\.startsWith\('<!-- LIVE_CODE -->\\n'\) \? postContent\.replace\('<!-- LIVE_CODE -->\\n', ''\) : postContent\),"
save_replacement = """      content: isLiveCode 
        ? (codeLanguage === 'live_html' ? `<!-- LIVE_CODE -->\\n${postContent}` : `<!-- CODE:${codeLanguage} -->\\n${postContent}`)
        : postContent,"""
text = re.sub(save_regex, save_replacement, text)

# Add UI for language selector
ui_regex = r"""                  <textarea
                    rows=\{16\}
                    value=\{postContent\}"""
ui_replacement = """                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <label className="text-xs font-semibold text-slate-300">Programming Language:</label>
                      <select 
                        value={codeLanguage} 
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="live_html">Live HTML/CSS/JS (Interactive)</option>
                        <option value="cpp">C / C++</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="javascript">JavaScript / Node.js</option>
                        <option value="typescript">React / Next.js (TypeScript)</option>
                        <option value="css">CSS / Tailwind</option>
                        <option value="sql">SQL / Database</option>
                      </select>
                    </div>
                    <textarea
                      rows={16}
                      value={postContent}"""
text = re.sub(ui_regex, ui_replacement, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

