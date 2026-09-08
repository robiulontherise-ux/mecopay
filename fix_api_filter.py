import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

old_filter = "const filteredBrands = brands.filter(b => isMerchantMode ? (b.merchant_api !== false) : b.personal_api);"
new_filter = "const filteredBrands = brands.filter(b => isMerchantMode ? b.merchant_api : b.personal_api);"

content = content.replace(old_filter, new_filter)

with open('src/components/DashboardShell.tsx', 'w') as f:
    f.write(content)
print("Fixed API filter!")
