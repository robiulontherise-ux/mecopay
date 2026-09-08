const fs = require('fs');
let code = fs.readFileSync('src/components/Legal.tsx', 'utf-8');

code = code.replace("আমাদের উকমার্স (WooCommerce) সিস্টেম", "আমাদের নো-কোড ওয়েবসাইট (No-code website)");
fs.writeFileSync('src/components/Legal.tsx', code);
console.log('WooCommerce replaced');
