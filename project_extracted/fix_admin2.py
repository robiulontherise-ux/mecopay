import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# I want to remove the block between:
#             {/* Category & Thumbnail & Telegram */}
# and 
#             {/* Content Editor / Preview */}
# But replace it with just Category and Thumbnail.

import_str = """            {/* Category & Thumbnail */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Thumbnail Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={postThumbnail}
                  onChange={(e) => setPostThumbnail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>"""

idx1 = text.find("            {/* Category & Thumbnail & Telegram */}")
idx2 = text.find("            {/* Content Editor / Preview */}")

if idx1 != -1 and idx2 != -1:
    text = text[:idx1] + import_str + "\n" + text[idx2:]

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

