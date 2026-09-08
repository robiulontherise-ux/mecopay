const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

code = code.replace(/text-yellow-400/g, 'text-white');

fs.writeFileSync('src/components/Login.tsx', code);
