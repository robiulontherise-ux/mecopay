const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

code = code.replace(
  'className="flex items-center gap-6 mt-3 text-sm md:text-base font-semibold text-neutral-300"',
  'className="flex items-center gap-6 mt-3 text-base md:text-lg font-bold text-neutral-300"'
);

fs.writeFileSync('src/components/Login.tsx', code);
