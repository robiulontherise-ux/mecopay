import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

old_if = "if (['Merchant API', 'Official Merchant API', 'Personal API', 'Plugins & Apps'].includes(activeSubMenu)) {"
new_if = "if (['Merchant API', 'Official Merchant API', 'Personal API'].includes(activeSubMenu)) {"

content = content.replace(old_if, new_if)

plugins_apps_view = """    if (activeSubMenu === 'Plugins & Apps') {
      return (
        <div className="max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Plugins & Apps</h2>
              <p className="text-sm text-slate-400">Download the Android App and configuration files for your integration.</p>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Android App & Config</h3>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
              Download the MecoPay Sync App and import your configuration file to connect your phone for Personal SMS verification.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                Download APK
              </button>
              <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2">
                Download Config (.json)
              </button>
            </div>
          </div>
        </div>
      );
    }
"""

# Insert plugins_apps_view before the new_if
content = content.replace(new_if, plugins_apps_view + "\n" + new_if)

with open('src/components/DashboardShell.tsx', 'w') as f:
    f.write(content)
print("Fixed plugins and apps!")
