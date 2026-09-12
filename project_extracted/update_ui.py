import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

toggles_html = """            </div>
            
            {/* POST DISPLAY SETTINGS */}
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
            </div>

            {/* Content Editor / Preview */}"""

text = text.replace("            </div>\n\n            {/* Content Editor / Preview */}", toggles_html)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)
