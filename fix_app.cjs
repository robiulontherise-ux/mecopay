const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('CustomerRightsAndAntiFraud')) {
  code = code.replace("import { PrivacyPolicy, TermsConditions, RefundPolicy } from './components/Legal';", "import { PrivacyPolicy, TermsConditions, RefundPolicy, CustomerRightsAndAntiFraud } from './components/Legal';");
  
  const oldRoutes = `<Route path="/refund-policy" element={<RefundPolicy />} />`;
  const newRoutes = `<Route path="/refund-policy" element={<RefundPolicy />} />\n          <Route path="/customer-rights" element={<CustomerRightsAndAntiFraud />} />\n          <Route path="/anti-fraud" element={<CustomerRightsAndAntiFraud />} />`;
  code = code.replace(oldRoutes, newRoutes);
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx updated');
}
