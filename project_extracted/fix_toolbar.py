import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Replace the DefaultEditor import with specific components
import_old = "import Editor, { DefaultEditor } from 'react-simple-wysiwyg';"
import_new = "import Editor, { Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnStrikeThrough, Separator, BtnNumberedList, BtnBulletList, BtnLink, BtnClearFormatting, BtnStyles } from 'react-simple-wysiwyg';"
text = text.replace(import_old, import_new)

# Replace DefaultEditor with custom Editor
editor_regex = r"""                      <DefaultEditor
                        value=\{postContent\}
                        onChange=\{\(e\) => setPostContent\(e\.target\.value\)\}
                        className="w-full p-4 font-sans text-sm leading-relaxed focus:outline-none"
                        style=\{\{ minHeight: '400px' \}\}
                      />"""

editor_replacement = """                      <Editor
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="w-full p-4 font-sans text-sm leading-relaxed focus:outline-none"
                        style={{ minHeight: '400px' }}
                      >
                        <Toolbar>
                          <BtnBold />
                          <BtnItalic />
                          <BtnUnderline />
                          <BtnStrikeThrough />
                          <Separator />
                          <input 
                            type="color" 
                            onChange={(e) => document.execCommand('foreColor', false, e.target.value)} 
                            title="Text Color" 
                            className="w-6 h-6 p-0 border-0 cursor-pointer bg-transparent" 
                          />
                          <Separator />
                          <select 
                            onChange={(e) => document.execCommand('fontSize', false, e.target.value)} 
                            className="text-xs border border-slate-300 rounded px-1 bg-white text-slate-700 h-6"
                            title="Text Size"
                          >
                            <option value="">Size</option>
                            <option value="2">Small</option>
                            <option value="3">Normal</option>
                            <option value="4">Medium</option>
                            <option value="5">Large</option>
                            <option value="6">X-Large</option>
                            <option value="7">Huge</option>
                          </select>
                          <Separator />
                          <BtnNumberedList />
                          <BtnBulletList />
                          <BtnLink />
                          <BtnClearFormatting />
                          <BtnStyles />
                        </Toolbar>
                      </Editor>"""

text = re.sub(editor_regex, editor_replacement, text)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)
