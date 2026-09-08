const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

if (!content.includes('useMemo,')) {
  content = content.replace("import React, { useState, useEffect }", "import React, { useState, useEffect, useMemo }");
  content = content.replace("import { useState, useEffect }", "import { useState, useEffect, useMemo }");
}

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched import.");
