const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const oldMarquee = 'className="text-2xl md:text-4xl font-bold text-neutral-300"';
const newMarquee = 'className="text-xl md:text-3xl font-bold text-neutral-300"';

code = code.split(oldMarquee).join(newMarquee);
fs.writeFileSync('src/components/Login.tsx', code);
console.log('Marquee fixed');
