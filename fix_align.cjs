const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const oldMotionDiv = `className="absolute inset-0 flex flex-col items-center justify-center space-y-2 md:space-y-4 w-full text-center"`;
const newMotionDiv = `className="absolute inset-0 flex flex-col items-center justify-start sm:justify-center pt-8 sm:pt-0 space-y-2 md:space-y-4 w-full text-center"`;

if (code.includes(oldMotionDiv)) {
  code = code.replace(oldMotionDiv, newMotionDiv);
  fs.writeFileSync('src/components/Login.tsx', code);
  console.log('Fixed alignment');
} else {
  console.log('Alignment already fixed or not found');
}
