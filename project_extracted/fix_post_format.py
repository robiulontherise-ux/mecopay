import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Add a state for post format
state_addition = r"  const \[postContent, setPostContent\] = useState\(''\);"
state_replacement = """  const [postContent, setPostContent] = useState('');
  const [isLiveCode, setIsLiveCode] = useState(false);"""
text = re.sub(state_addition, state_replacement, text)

# Set isLiveCode when editing
edit_addition = r"    setPostContent\(post\.content \|\| ''\);"
edit_replacement = """    setPostContent(post.content || '');
    setIsLiveCode(post.content?.startsWith('<!-- LIVE_CODE -->') || false);"""
text = re.sub(edit_addition, edit_replacement, text)

# Modify handleSavePostForm
save_addition = r"      content: postContent,"
save_replacement = """      content: isLiveCode && !postContent.startsWith('<!-- LIVE_CODE -->') ? `<!-- LIVE_CODE -->\\n${postContent}` : (!isLiveCode && postContent.startsWith('<!-- LIVE_CODE -->\\n') ? postContent.replace('<!-- LIVE_CODE -->\\n', '') : postContent),"""
text = re.sub(save_addition, save_replacement, text)

# Add the UI for the toggle
ui_addition = r"              <div className=\"flex items-center justify-between mb-2\">"
ui_replacement = """              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-200">
                    Post Format
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="postFormat" checked={!isLiveCode} onChange={() => setIsLiveCode(false)} className="text-indigo-500 bg-slate-900 border-slate-700" />
                      <span className="text-xs text-slate-300">Markdown (C++, Java, Python, Text)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="postFormat" checked={isLiveCode} onChange={() => setIsLiveCode(true)} className="text-indigo-500 bg-slate-900 border-slate-700" />
                      <span className="text-xs text-slate-300">Live HTML/JS/CSS (Interactive)</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">"""
text = re.sub(ui_addition, ui_replacement, text, count=1)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

with open('src/components/PostDetail.tsx', 'r') as f:
    pd_text = f.read()

pd_regex = r"              \{post\.content && \(post\.content\.includes\('<script'\) \|\| post\.content\.includes\('<style'\) \|\| post\.content\.includes\('<html'\) \|\| post\.content\.includes\('<canvas'\) \|\| post\.content\.includes\('<div'\)\) \? \("
pd_replacement = """              {post.content && post.content.startsWith('<!-- LIVE_CODE -->') ? ("""
pd_text = re.sub(pd_regex, pd_replacement, pd_text)

with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(pd_text)

