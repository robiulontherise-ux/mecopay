import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

# We need to replace the brand form section.
# Let's search for "Basic Information" section.

start_str = '<h3 className="text-lg font-bold text-blue-400 border-b border-slate-700/50 pb-2">Basic Information</h3>'
end_str = '<h3 className="text-lg font-bold text-blue-400 border-b border-slate-700/50 pb-2">Brand Identity</h3>'

idx1 = content.find(start_str)
idx2 = content.find(end_str)

if idx1 != -1 and idx2 != -1:
    old_section = content[idx1:idx2]
    new_section = """<h3 className="text-lg font-bold text-blue-400 border-b border-slate-700/50 pb-2">Basic Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Brand Name <span className="text-red-500">*</span></label>
                    <input type="text" value={brandForm.name} onChange={(e) => setBrandForm({...brandForm, name: e.target.value})} placeholder="e.g., MecoPay" className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Primary Website URL</label>
                    <input 
                      type="text" 
                      value={brandForm.website_url} 
                      onChange={(e) => setBrandForm({...brandForm, website_url: e.target.value})} 
                      placeholder="e.g. https://yourwebsite.com" 
                      className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  """
    content = content[:idx1] + new_section + content[idx2:]
    with open('src/components/DashboardShell.tsx', 'w') as f:
        f.write(content)
    print("Fixed Basic Information section.")
else:
    print("Section not found!")

