const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

code = code.replace(/transition={{ ease: "linear", duration: 25, repeat: Infinity }}/g, 'transition={{ ease: "linear", duration: 15, repeat: Infinity }}');

fs.writeFileSync('src/components/Login.tsx', code);
