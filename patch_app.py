import os

with open('src/App.tsx', 'r') as f:
    content = f.read()

import_statement = "import CheckoutPage from './components/checkout/CheckoutPage';\n"
if "CheckoutPage" not in content:
    idx = content.find("import { PrivacyPolicy")
    content = content[:idx] + import_statement + content[idx:]

route_statement = '          <Route path="/checkout/:slug" element={<CheckoutPage />} />\n'
if "/checkout/:slug" not in content:
    idx = content.find("{/* Legal Pages */}")
    content = content[:idx] + "{/* Public Checkout */}\n" + route_statement + "\n          " + content[idx:]

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App.tsx patched.")
