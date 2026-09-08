const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');
code = code.replace("text-[#c084fc] font-black", "text-emerald-400 font-black");
fs.writeFileSync('src/components/Login.tsx', code);
