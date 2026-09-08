import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

# 1. Update API Gateway Selection text
content = content.replace(
    '<span className="text-xs text-slate-400">Select one or both</span>',
    '<span className="text-xs text-slate-400">Optional (Select as needed)</span>'
)

# 2. Update Verification Methods heading and opacity
old_verify_heading = """                {/* Verification settings for Personal SMS API */}
                <div className={`mb-6 transition-all ${brandForm.personal_api ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="flex justify-between items-center mb-3 border-b border-slate-700/50 pb-2">
                     <div>
                       <h4 className="text-sm font-bold text-slate-200">Personal SMS Verification Method</h4>
                       <p className="text-[11px] text-purple-400">Applies to Personal SMS API integrations</p>
                     </div>"""

new_verify_heading = """                {/* Verification settings */}
                <div className={`mb-6 transition-all opacity-100`}>
                  <div className="flex justify-between items-center mb-3 border-b border-slate-700/50 pb-2">
                     <div>
                       <h4 className="text-sm font-bold text-slate-200">Verification Methods</h4>
                       <p className="text-[11px] text-slate-400">Select how to verify customer payments (TrxID or Phone)</p>
                     </div>"""

content = content.replace(old_verify_heading, new_verify_heading)

with open('src/components/DashboardShell.tsx', 'w') as f:
    f.write(content)
print("Updated verification UI!")
