const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const oldTextContainer = `className="h-auto min-h-[14rem] sm:min-h-[16rem] md:min-h-[20rem] flex flex-col items-center justify-center text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-loose md:leading-relaxed mb-12 max-w-7xl mx-auto w-full px-2 sm:px-4 relative"`;
const newTextContainer = `className="h-auto min-h-[14rem] sm:min-h-[16rem] md:min-h-[20rem] flex flex-col items-center justify-center text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-loose md:leading-relaxed mb-12 max-w-7xl mx-auto w-full px-2 sm:px-4 relative"`;
code = code.replace(oldTextContainer, newTextContainer);

fs.writeFileSync('src/components/Login.tsx', code);
