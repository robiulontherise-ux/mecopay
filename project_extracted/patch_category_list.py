import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Let's replace the category listing to show hierarchy
list_old = """            <div className="lg:col-span-2 space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between group hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {cat.order_index}
                    </span>
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-white truncate">{cat.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">/{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditCategoryClick(cat)}
                      className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>"""

list_new = """            <div className="lg:col-span-2 space-y-3">
              {categories.filter(c => !c.parent_id).sort((a,b) => a.order_index - b.order_index).map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between group hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {cat.order_index}
                      </span>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-white truncate">{cat.name}</h4>
                        <p className="text-[10px] text-slate-500 truncate">/{cat.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditCategoryClick(cat)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {/* Subcategories */}
                  {categories.filter(sub => sub.parent_id === cat.id).sort((a,b) => a.order_index - b.order_index).map(sub => (
                    <div key={sub.id} className="ml-8 bg-slate-800/50 border border-slate-700/50 rounded-xl p-2.5 flex items-center justify-between group hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0"></div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-300 truncate">{sub.name}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditCategoryClick(sub)}
                          className="p-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteCategory(sub.id)}
                          className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>"""

text = text.replace(list_old, list_new)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)
