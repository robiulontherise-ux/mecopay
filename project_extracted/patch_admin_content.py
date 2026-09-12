import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

site_settings_tab = """        {/* TAB 5: SITE SETTINGS */}
        {activeTab === 'site-settings' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  Site Design & Settings
                </h3>
                <p className="text-xs text-slate-400 mt-1">Change website name, color, and logo.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Website Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. RSG SHOP"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Website Logo URL</label>
                <input
                  type="text"
                  value={siteLogo}
                  onChange={(e) => setSiteLogo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="Leave empty for default"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Primary Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Global Text Size</label>
                  <select
                    value={textSize}
                    onChange={(e) => setTextSize(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="small">Small</option>
                    <option value="normal">Normal (Default)</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveSettingsSubmit}
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20"
              >
                Save Site Design
              </button>
            </div>

            {/* Default Home Page Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  Default Home Page
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure what shows before selecting any category.</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-800 rounded-xl border border-slate-700">
                <input
                  type="checkbox"
                  checked={showDefaultHome}
                  onChange={(e) => setShowDefaultHome(e.target.checked)}
                  className="w-4 h-4 text-indigo-500 bg-slate-900 border-slate-700 rounded"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-200 block">Enable Default Landing Page</span>
                  <span className="text-xs text-slate-400">Shows the content below instead of all posts on root URL</span>
                </div>
              </label>

              {showDefaultHome && (
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
                        <BtnNumberedList />
                        <BtnBulletList />
                        <BtnLink />
                        <BtnClearFormatting />
                        <BtnStyles />
                      </Toolbar>
                    </Editor>
                  </div>
                  
                  <button
                    onClick={handleSaveSettingsSubmit}
                    className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20"
                  >
                    Save Landing Page
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3 & 4: CREATE / EDIT POST WITH MARKDOWN STUDIO */}"""

text = text.replace("        {/* TAB 3 & 4: CREATE / EDIT POST WITH MARKDOWN STUDIO */}", site_settings_tab)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

