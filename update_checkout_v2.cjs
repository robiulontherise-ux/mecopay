const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

// 1. Replace the RPC check
const rpcCheckPattern = /\/\/ Check device online status using backend RPC[\s\S]*?setIsDeviceOnline\(online\);/m;
const newDeviceCheck = `// Online status is now handled by Realtime Presence in a separate useEffect`;
content = content.replace(rpcCheckPattern, newDeviceCheck);

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
