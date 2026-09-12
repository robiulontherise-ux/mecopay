import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

import_statement = "import Editor, { DefaultEditor } from 'react-simple-wysiwyg';\n"
if "react-simple-wysiwyg" not in text:
    text = text.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + import_statement)

editor_regex = r"""                    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
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

editor_replacement = """                    <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-800 text-slate-900">
                      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Rich Text Editor</div>
                      <DefaultEditor
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="w-full p-4 font-sans text-sm leading-relaxed focus:outline-none"
                        style={{ minHeight: '400px' }}
                      />
                    </div>"""

text = re.sub(editor_regex, editor_replacement, text)

# RLS error fix
error_regex = r"""      if \(uploadError\) \{
        throw uploadError;
      \}"""
      
error_replacement = """      if (uploadError) {
        if (uploadError.message.includes('row-level security policy')) {
          alert('Supabase Storage Error: Your Supabase database is blocking image uploads because Row Level Security (RLS) is enabled.\\n\\nPlease go to your Supabase Dashboard -> SQL Editor and run this query:\\n\\nCREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = \\\'potimg\\\');');
        }
        throw uploadError;
      }"""

text = re.sub(error_regex, error_replacement, text)

# Image insertion logic fix
img_replace_regex = r"""        const textareaId = isLiveCode \? 'code-editor-textarea' : 'normal-editor-textarea';
        const textarea = document\.getElementById\(textareaId\) as HTMLTextAreaElement;
        
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
           setPostContent(prev => prev + '<br/>' + imageMarkdown + '<br/>');
        }"""

text = re.sub(img_replace_regex, img_replace_replacement, text)


with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

