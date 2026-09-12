import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

logo_old = """              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Website Logo URL</label>
                <input
                  type="text"
                  value={siteLogo}
                  onChange={(e) => setSiteLogo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="Leave empty for default"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">"""

logo_new = """              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Website Logo</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={siteLogo}
                    onChange={(e) => setSiteLogo(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="URL or upload..."
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center h-full border border-slate-700"
                    >
                      {isUploading ? '...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Logo Name Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={siteNameColor || '#ffffff'}
                      onChange={(e) => setSiteNameColor(e.target.value)}
                      className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <button onClick={() => setSiteNameColor('')} className="text-[10px] text-slate-400 hover:text-white">Clear</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Logo Name Size</label>
                  <select
                    value={siteNameSize}
                    onChange={(e) => setSiteNameSize(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="small">Small</option>
                    <option value="normal">Normal (Default)</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">"""

text = text.replace(logo_old, logo_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

