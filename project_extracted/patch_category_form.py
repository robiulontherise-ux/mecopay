import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

form_old = """                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </form>"""

form_new = """                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Parent Category (Optional)</label>
                  <select
                    value={catParentId || ''}
                    onChange={(e) => setCatParentId(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">None (Main Category)</option>
                    {categories.filter(c => !c.parent_id && c.id !== editingCategory?.id).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </form>"""

text = text.replace(form_old, form_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)
