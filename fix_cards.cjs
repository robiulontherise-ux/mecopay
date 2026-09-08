const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

code = code.split('className="text-3xl md:text-4xl font-black text-white mb-4"').join('className="text-2xl md:text-3xl font-black text-white mb-4"');
code = code.split('className="text-xl text-neutral-400 leading-relaxed"').join('className="text-lg text-neutral-400 leading-relaxed"');

fs.writeFileSync('src/components/Login.tsx', code);
console.log('Cards fixed');
