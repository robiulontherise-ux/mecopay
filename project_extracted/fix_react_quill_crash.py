import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Replace ReactQuill with a native textarea for normal posts to avoid library crashes
quill_regex = r"""                  <div className="bg-slate-100 rounded-xl overflow-hidden text-slate-900">
                    <ReactQuill 
                      theme="snow" 
                      value=\{postContent\} 
                      onChange=\{setPostContent\} 
                      className="h-\[400px\] mb-10"
                      modules=\{\{
                        toolbar: \[
                          \[\{ 'header': \[1, 2, 3, 4, 5, 6, false\] \}\],
                          \[\{ 'size': \['small', false, 'large', 'huge'\] \}\],
                          \[\{ 'color': \[\] \}, \{ 'background': \[\] \}\],
                          \['bold', 'italic', 'underline', 'strike', 'blockquote'\],
                          \[\{ 'list': 'ordered'\}, \{ 'list': 'bullet' \}, \{ 'indent': '-1'\}, \{ 'indent': '\+1' \}\],
                          \['link', 'image', 'video'\],
                          \['clean'\]
                        \],
                      \}\}
                    \/>
                  <\/div>"""
quill_replacement = """                  <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                    <textarea
                      id="normal-editor-textarea"
                      rows={16}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Write your article here (supports Markdown and HTML)..."
                      className="w-full p-4 bg-transparent text-slate-100 font-sans text-sm leading-relaxed focus:outline-none focus:ring-0 resize-y"
                    />
                  </div>"""

text = re.sub(quill_regex, quill_replacement, text)

# Remove ReactQuill import
text = re.sub(r"import ReactQuill from 'react-quill';\n", "", text)
text = re.sub(r"import 'react-quill/dist/quill\.snow\.css';\n", "", text)

# Update image upload to insert into the correct textarea based on isLiveCode
img_replace_regex = r"""        if \(isLiveCode\) \{
          const textarea = document\.getElementById\('code-editor-textarea'\) as HTMLTextAreaElement;
          if \(textarea\) \{
            const start = textarea\.selectionStart;
            const end = textarea\.selectionEnd;
            const before = postContent\.substring\(0, start\);
            const after = postContent\.substring\(end\);
            setPostContent\(before \+ imageMarkdown \+ after\);
            setTimeout\(\(\) => \{
              textarea\.selectionStart = textarea\.selectionEnd = start \+ imageMarkdown\.length;
              textarea\.focus\(\);
            \}, 0\);
          \} else \{
            setPostContent\(prev => prev \+ imageMarkdown\);
          \}
        \} else \{
          setPostContent\(prev => prev \+ imageMarkdown\);
        \}"""

img_replace_replacement = """        const textareaId = isLiveCode ? 'code-editor-textarea' : 'normal-editor-textarea';
        const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
        
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const before = postContent.substring(0, start);
          const after = postContent.substring(end);
          setPostContent(before + imageMarkdown + after);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
            textarea.focus();
          }, 0);
        } else {
          setPostContent(prev => prev + imageMarkdown);
        }"""

text = re.sub(img_replace_regex, img_replace_replacement, text)


with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

