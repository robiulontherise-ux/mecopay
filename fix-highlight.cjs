const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// Replace the highlight animation block
const oldBlock = `<motion.div 
                    initial={{ left: 0, width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5, delay: 0.3 + lineIndex * 0.35, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 left-0 bg-blue-600/80 z-0 rounded-lg shadow-sm"
                  />`;

const newBlock = `<motion.div 
                    initial={{ left: 0, width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.3 + lineIndex * 0.45, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 left-0 bg-[#c084fc]/80 z-0 rounded-lg shadow-sm"
                  />`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('src/components/Login.tsx', code);
