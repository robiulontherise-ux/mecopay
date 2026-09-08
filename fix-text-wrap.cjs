const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// Remove whitespace-nowrap from the individual text line container
const oldLineClass = `className="relative inline-block overflow-hidden py-1 whitespace-nowrap"`;
const newLineClass = `className="relative inline-block overflow-hidden py-1"`;
code = code.replace(oldLineClass, newLineClass);

// Remove overflow-hidden from the main text container and adjust font size to be a bit more responsive
const oldContainer = `className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-[14px] xs:text-base sm:text-xl md:text-3xl lg:text-4xl font-extrabold leading-relaxed md:leading-tight mb-12 max-w-7xl mx-auto w-full px-2 relative overflow-hidden"`;
const newContainer = `className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-sm xs:text-base sm:text-xl md:text-3xl lg:text-4xl font-extrabold leading-relaxed md:leading-tight mb-12 max-w-7xl mx-auto w-full px-2 relative"`;
code = code.replace(oldContainer, newContainer);

fs.writeFileSync('src/components/Login.tsx', code);
