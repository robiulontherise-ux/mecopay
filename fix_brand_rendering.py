import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

# Fix table row API tags
old_api_tags = """                          <div className="flex gap-1.5">
                            {(brand.merchant_api !== false) && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/20">Merchant</span>}
                            {brand.personal_api && <span className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/20">Personal</span>}
                          </div>"""
new_api_tags = """                          <div className="flex gap-1.5">
                            {brand.merchant_api && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/20">Merchant</span>}
                            {brand.personal_api && <span className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/20">Personal</span>}
                            {!brand.merchant_api && !brand.personal_api && <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded">No API</span>}
                          </div>"""

# Fix table row verification tags
old_verif_tags = """                          <div className="flex gap-1.5">
                            {(brand.verify_trx_id !== false) && <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded">TrxID</span>}
                            {brand.verify_phone && <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded">Phone</span>}
                          </div>"""
new_verif_tags = """                          <div className="flex gap-1.5">
                            {brand.verify_trx_id && <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded">TrxID</span>}
                            {brand.verify_phone && <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded">Phone</span>}
                          </div>"""


# Fix form initialization
old_form_init = """      verify_trx_id: brand.verify_trx_id !== false,
      verify_phone: !!brand.verify_phone,
      merchant_api: brand.merchant_api !== false,
      personal_api: !!brand.personal_api"""
new_form_init = """      verify_trx_id: !!brand.verify_trx_id,
      verify_phone: !!brand.verify_phone,
      merchant_api: !!brand.merchant_api,
      personal_api: !!brand.personal_api"""

content = content.replace(old_api_tags, new_api_tags)
content = content.replace(old_verif_tags, new_verif_tags)
content = content.replace(old_form_init, new_form_init)

with open('src/components/DashboardShell.tsx', 'w') as f:
    f.write(content)
print("Fixed tags and form init!")
