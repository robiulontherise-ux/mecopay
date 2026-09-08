const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const oldCheck = 'const isHighlight = line.includes("পেমেন্ট গেটওয়ে") || line.includes("নো-কোড ওয়েবসাইট") || line.includes("No-Code ওয়েবসাইট") || line.includes("API ও Payment Link");';
const newCheck = 'const isHighlight = line.includes("পেমেন্ট গেটওয়ে") || line.includes("নো-কোড ওয়েবসাইট") || line.includes("No-Code ওয়েবসাইট") || line.includes("API ও Link ব্যবহার করে") || line.includes("Payment Link সোশ্যাল মিডিয়ায়");';

code = code.replace(oldCheck, newCheck);
fs.writeFileSync('src/components/Login.tsx', code);
console.log('Highlight logic updated');
