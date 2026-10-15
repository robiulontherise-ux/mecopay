const fs = require('fs');

let c = fs.readFileSync('src/components/DeveloperDocs.tsx', 'utf8');

// 1. Remove the worker-code tab button
const btnRegex = /<button\s+onClick=\{\(\)\s*=>\s*setActiveTab\('worker-code'\)\}[\s\S]*?<\/button>/;
if (btnRegex.test(c)) {
  c = c.replace(btnRegex, '');
  console.log('Removed worker-code tab button');
} else {
  console.log('worker-code button not found with regex');
}

// Re-number tab 5 to tab 4
c = c.replace('৫. API Credentials & Base URL', '৪. API Credentials & Base URL');

// 2. Remove the activeTab === 'worker-code' content block
const idx = c.indexOf("activeTab === 'worker-code'");
if (idx !== -1) {
  const startBrace = c.lastIndexOf('{', idx);
  const endMatch = c.indexOf('{/* TAB 5: API CREDENTIALS', idx);
  if (endMatch !== -1) {
    c = c.substring(0, startBrace) + '{/* TAB 4: API CREDENTIALS & BASE URL */}\n      ' + c.substring(endMatch + "{/* TAB 5: API CREDENTIALS & BASE URL */}".length);
    console.log('Removed worker-code section successfully');
  }
}

// 3. Remove const cloudflareWorkerCode definition at the bottom
const codeDefIdx = c.indexOf('const cloudflareWorkerCode =');
if (codeDefIdx !== -1) {
  c = c.substring(0, codeDefIdx).trim() + '\n';
  console.log('Removed const cloudflareWorkerCode definition');
}

// 4. Update rawPhpController payload to include currency support
if (c.includes("$orderId = $_POST['order_id'] ??")) {
  c = c.replace(
    /(\$orderId\s*=\s*\$_POST\['order_id'\]\s*\?\?[^\n]+\n\s*\$payload\s*=\s*\[\n\s*["']order_id["']\s*=>\s*\$orderId,)/,
    `$1\n        'currency'         => !empty($_POST['currency']) ? strtoupper(trim($_POST['currency'])) : 'USD',`
  );
  console.log('Updated raw PHP payload with currency');
}

// 5. Update nodeJsFullController payload to include currency support
if (c.includes("order_id: order_id || `ORD-${Date.now()}`,")) {
  c = c.replace(
    "order_id: order_id || `ORD-${Date.now()}`,",
    "order_id: order_id || `ORD-${Date.now()}`,\n    currency: req.body.currency ? String(req.body.currency).trim().toUpperCase() : 'USD',"
  );
  console.log('Updated Node.js payload with currency');
}

fs.writeFileSync('src/components/DeveloperDocs.tsx', c);
console.log('All changes applied cleanly to DeveloperDocs.tsx');
