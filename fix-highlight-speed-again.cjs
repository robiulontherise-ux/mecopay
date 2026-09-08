const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// Increase interval from 6500 to 10000 for more reading time
code = code.replace(/setInterval\(\(\) => \{\n      setCurrentChunk\(\(prev\) => \(prev \+ 1\) % textChunks\.length\);\n    \}, 6500\);/g, `setInterval(() => {
      setCurrentChunk((prev) => (prev + 1) % textChunks.length);
    }, 10000);`);

// Replace highlight animation
const oldHighlight = `<motion.div 
                    initial={{ left: 0, width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 0.5 + lineIndex * 1.0, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 left-0 bg-[#c084fc]/80 z-0 rounded-lg shadow-sm"
                  />`;

const newHighlight = `<motion.div 
                    initial={{ left: 0, width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.0, delay: 0.5 + lineIndex * 2.0, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 left-0 bg-[#c084fc]/80 z-0 rounded-lg shadow-sm"
                  />`;
                  
code = code.replace(oldHighlight, newHighlight);

fs.writeFileSync('src/components/Login.tsx', code);
