import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

home_old = """              {showDefaultHome && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">Page Content (HTML/Rich Text)</label>
                  <div className="bg-slate-50 text-slate-900 rounded-xl overflow-hidden min-h-[300px]">
                    <Editor
                      value={defaultHomeContent}
                      onChange={(e) => setDefaultHomeContent(e.target.value)}
                      className="w-full p-4 font-sans text-sm"
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
                    </Editor>
                  </div>
                </div>
              )}"""


home_new = """              {showDefaultHome && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={defaultHomeFormatType !== 'code'} onChange={() => setDefaultHomeFormatType('standard')} className="text-indigo-500 bg-slate-900 border-slate-700" />
                      <span className="text-xs text-slate-300 font-medium">Normal Page (Rich Text)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={defaultHomeFormatType === 'code'} onChange={() => setDefaultHomeFormatType('code')} className="text-indigo-500 bg-slate-900 border-slate-700" />
                      <span className="text-xs text-slate-300 font-medium">Programming Code (Live HTML)</span>
                    </label>
                  </div>
                  
                  {defaultHomeFormatType !== 'code' ? (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-300">Page Content (HTML/Rich Text)</label>
                      <div className="bg-slate-50 text-slate-900 rounded-xl overflow-hidden min-h-[300px]">
                        <Editor
                          value={defaultHomeContent}
                          onChange={(e) => setDefaultHomeContent(e.target.value)}
                          className="w-full p-4 font-sans text-sm"
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
                        </Editor>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700 space-y-1">
                        <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                          All Languages Supported
                        </div>
                        <p className="text-[11px] text-slate-400">
                          You don't need to select a specific language. You can use <strong>HTML, CSS, JS, Python, C++, Java, Node.js, PHP</strong> or any combination of code directly in this editor. It will render raw or interpret web codes automatically!
                        </p>
                      </div>
                      <textarea
                        rows={16}
                        value={defaultHomeContent}
                        onChange={(e) => setDefaultHomeContent(e.target.value)}
                        placeholder="Paste your HTML, JS, CSS, Python, C++ or any other raw code here..."
                        className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              )}"""

text = text.replace(home_old, home_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

