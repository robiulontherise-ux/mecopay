const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const oldMapStart = '{textChunks[currentChunk] && textChunks[currentChunk].map((line, lineIndex) => {';
// I will just use split and slice for exact replacement
const oldBlock = `              {textChunks[currentChunk] && textChunks[currentChunk].map((line, lineIndex) => {
                const isHighlight = line.includes("পেমেন্ট গেটওয়ে") || line.includes("নো-কোড ওয়েবসাইট") || line.includes("No-Code ওয়েবসাইট") || line.includes("API ও Link ব্যবহার করে") || line.includes("Payment Link সোশ্যাল মিডিয়ায়");
                const isLongText = currentChunk === 1 && lineIndex >= 2;
                return (
                <div key={lineIndex} className="relative inline-block py-1 md:py-2 px-1 md:px-2">
                  <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: lineIndex * 0.2,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className={\`inline-block relative z-10 drop-shadow-md px-1 md:px-2 leading-tight md:leading-relaxed \${isHighlight ? 'text-emerald-400 font-black' : 'text-white'} \${isLongText ? 'text-[14px] xs:text-base sm:text-lg md:text-xl lg:text-2xl mt-0.5' : ''}\`}
                  >`;

const newBlock = `              {textChunks[currentChunk] && textChunks[currentChunk].map((line, lineIndex) => {
                const isLongText = currentChunk === 1 && lineIndex >= 2;
                return (
                <div key={lineIndex} className="relative inline-block py-1 md:py-2 px-1 md:px-2">
                  <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: lineIndex * 0.2,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className={\`inline-block relative z-10 text-white drop-shadow-md px-1 md:px-2 leading-tight md:leading-relaxed \${isLongText ? 'text-[13px] xs:text-sm sm:text-lg md:text-xl lg:text-2xl mt-0.5' : ''}\`}
                  >`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/components/Login.tsx', code);
console.log('Fixed highlight');
