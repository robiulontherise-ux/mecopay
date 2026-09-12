import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

import_statement = "import Editor, { DefaultEditor } from 'react-simple-wysiwyg';\n"
text = re.sub(r"import React, \{ useState, useEffect \} from 'react';\n", "import React, { useState, useEffect } from 'react';\n" + import_statement, text)

editor_regex = r"""                  <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                    <div className="bg-slate-800/80 border-b border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300">Editor</div>
                    <textarea
                      id="normal-editor-textarea"
                      rows=\{16\}
                      value=\{postContent\}
                      onChange=\{\(e\) => setPostContent\(e\.target\.value\)\}
                      placeholder="Write your article here \(supports Markdown\)\.\.\."
                      className="w-full p-4 bg-transparent text-slate-100 font-sans text-sm leading-relaxed focus:outline-none focus:ring-0 resize-y h-\[400px\]"
                    />
                  </div>"""

editor_replacement = """                  <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-800 text-slate-900">
                    <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Rich Text Editor</div>
                    <Editor
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      containerProps={{ style: { height: '400px', overflowY: 'auto' } }}
                      className="w-full h-full p-4 font-sans text-sm leading-relaxed focus:outline-none"
                    />
                  </div>"""

text = re.sub(editor_regex, editor_replacement, text)

# For RLS error: show a specific error message
error_regex = r"""      if \(uploadError\) \{
        throw uploadError;
      \}"""
      
error_replacement = """      if (uploadError) {
        if (uploadError.message.includes('row-level security policy')) {
          alert('Supabase Storage RLS Error! Please go to your Supabase SQL Editor and run:\\n\\nCREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = \\\'potimg\\\');');
        }
        throw uploadError;
      }"""

text = re.sub(error_regex, error_replacement, text)

# Also fix the image upload insertion because we're using a rich text editor now, which is HTML
# The previous image insertion logic:
img_replace_regex = r"""        const textareaId = isLiveCode \? 'code-editor-textarea' : 'normal-editor-textarea';
        const textarea = document.getElementById\(textareaId\) as HTMLTextAreaElement;
        
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
        \}"""

img_replace_replacement = """        if (isLiveCode) {
          const textarea = document.getElementById('code-editor-textarea') as HTMLTextAreaElement;
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
          }
        } else {
           // Rich text editor insertion
           setPostContent(prev => prev + '<br/>' + imageMarkdown + '<br/>');
        }"""

text = re.sub(img_replace_regex, img_replace_replacement, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

