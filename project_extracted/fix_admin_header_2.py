import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

missing_part = """            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  Admin CMS Studio
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Live Supabase Sync
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Authenticated Admin: <strong className="text-purple-300">{userEmail || ADMIN_EMAIL}</strong>
                </p>
              </div>
            </div>
          </div>
          {/* Tab Navigation */}
"""

search_str = """            <button
              onClick={onBackToSite}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to Student Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">"""

replace_str = """            <button
              onClick={onBackToSite}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to Student Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
""" + missing_part + """          <div className="flex items-center gap-2 overflow-x-auto pb-1">"""

new_text = text.replace(search_str, replace_str)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(new_text)

