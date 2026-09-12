import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

display_old = """            {/* POST DISPLAY SETTINGS */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 mb-2">Display & Privacy Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showDetailsBtn} onChange={(e) => setShowDetailsBtn(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                  <span className="text-xs text-slate-300">Show "View Details" Button</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showShareBtn} onChange={(e) => setShowShareBtn(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                  <span className="text-xs text-slate-300">Show "Share" Button</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showThumbnail} onChange={(e) => setShowThumbnail(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                  <span className="text-xs text-slate-300">Show Thumbnail Image</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showFullPost} onChange={(e) => setShowFullPost(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                  <span className="text-xs text-slate-300">Show Full Content in List</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer sm:col-span-2 mt-2 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <input type="checkbox" checked={isCustomPage} onChange={(e) => setIsCustomPage(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                  <div>
                    <span className="text-xs font-bold text-indigo-300 block">Make this a Custom Hidden Page</span>
                    <span className="text-[10px] text-slate-400">If checked, this post will NOT show on the website. It can only be accessed directly via its link.</span>
                  </div>
                </label>
              </div>
            </div>"""

display_new = """            {/* POST DISPLAY SETTINGS - Collapsible */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="w-full flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-750 transition-colors cursor-pointer text-left focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  <span className="text-sm font-bold text-slate-200">Display & Privacy Settings</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${showSettingsPanel ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              
              {showSettingsPanel && (
                <div className="p-4 pt-2 border-t border-slate-700/50 space-y-3 bg-slate-900/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showDetailsBtn} onChange={(e) => setShowDetailsBtn(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                      <span className="text-xs text-slate-300">Show "View Details" Button</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showShareBtn} onChange={(e) => setShowShareBtn(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                      <span className="text-xs text-slate-300">Show "Share" Button</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showThumbnail} onChange={(e) => setShowThumbnail(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                      <span className="text-xs text-slate-300">Show Thumbnail Image</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showFullPost} onChange={(e) => setShowFullPost(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                      <span className="text-xs text-slate-300">Show Full Content in List</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer sm:col-span-2 mt-2 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <input type="checkbox" checked={isCustomPage} onChange={(e) => setIsCustomPage(e.target.checked)} className="text-indigo-500 bg-slate-900 border-slate-700 rounded" />
                      <div>
                        <span className="text-xs font-bold text-indigo-300 block">Make this a Custom Hidden Page</span>
                        <span className="text-[10px] text-slate-400">If checked, this post will NOT show on the website. It can only be accessed directly via its link.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>"""

text = text.replace(display_old, display_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

