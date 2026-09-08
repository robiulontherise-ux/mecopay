const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const importStatement = `import Login from './components/Login';
import DashboardShell from './components/DashboardShell';`;
const newImportStatement = `import Login from './components/Login';
import DashboardShell from './components/DashboardShell';
import { PrivacyPolicy, TermsConditions, RefundPolicy } from './components/Legal';`;
code = code.replace(importStatement, newImportStatement);

const routes = `{/* Authentication */}
          <Route
            path="/login"
            element={!session ? <Login /> : <Navigate to="/dashboard" />}
          />`;
const newRoutes = `{/* Authentication */}
          <Route
            path="/login"
            element={!session ? <Login /> : <Navigate to="/dashboard" />}
          />
          
          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />`;
code = code.replace(routes, newRoutes);

fs.writeFileSync('src/App.tsx', code);
