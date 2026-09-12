import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Add imports
imports = """import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';"""
text = re.sub(r"import React, \{ useState, useEffect \} from 'react';", imports, text)

# Modify the post format UI
format_ui_regex = r"""                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="postFormat" checked=\{!isLiveCode\} onChange=\{\(\) => setIsLiveCode\(false\)\} className="text-indigo-500 bg-slate-900 border-slate-700" \/>
                      <span className="text-xs text-slate-300">Markdown \(C\+\+, Java, Python, Text\)<\/span>
                    <\/label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="postFormat" checked=\{isLiveCode\} onChange=\{\(\) => setIsLiveCode\(true\)\} className="text-indigo-500 bg-slate-900 border-slate-700" \/>
                      <span className="text-xs text-slate-300">Live HTML/JS/CSS \(Interactive\)<\/span>
                    <\/label>"""
format_ui_replacement = """                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="postFormat" checked={!isLiveCode} onChange={() => setIsLiveCode(false)} className="text-indigo-500 bg-slate-900 border-slate-700" />
                      <span className="text-xs text-slate-300">Normal Post (Rich Text, Color, Size)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="postFormat" checked={isLiveCode} onChange={() => setIsLiveCode(true)} className="text-indigo-500 bg-slate-900 border-slate-700" />
                      <span className="text-xs text-slate-300">Programming Code (Live HTML / Syntax)</span>
                    </label>"""
text = re.sub(format_ui_regex, format_ui_replacement, text)

# Replace the textarea with Quill for normal posts
textarea_regex = r"""              \{\!markdownPreview \? \(
                <textarea
                  rows=\{14\}
                  value=\{postContent\}
                  onChange=\{\(e\) => setPostContent\(e\.target\.value\)\}
                  placeholder="Write in Markdown or raw HTML/JS/CSS format\.\.\."
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
                \/>
              \) : \("""
textarea_replacement = """              {!markdownPreview ? (
                !isLiveCode ? (
                  <div className="bg-slate-100 rounded-xl overflow-hidden text-slate-900">
                    <ReactQuill 
                      theme="snow" 
                      value={postContent} 
                      onChange={setPostContent} 
                      className="h-[400px] mb-10"
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                          [{ 'size': ['small', false, 'large', 'huge'] }],
                          [{ 'color': [] }, { 'background': [] }],
                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
                          ['link', 'image', 'video'],
                          ['clean']
                        ],
                      }}
                    />
                  </div>
                ) : (
                  <textarea
                    rows={16}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Paste your C++, Python, Java or HTML/JS/CSS code here..."
                    className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
                  />
                )
              ) : ("""
text = re.sub(textarea_regex, textarea_replacement, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

