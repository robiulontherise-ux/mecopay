const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// Increase interval from 4000 to 6500 for more reading time
code = code.replace(/setInterval\(\(\) => \{\n      setCurrentChunk\(\(prev\) => \(prev \+ 1\) % textChunks\.length\);\n    \}, 4000\);/g, `setInterval(() => {
      setCurrentChunk((prev) => (prev + 1) % textChunks.length);
    }, 6500);`);

// Replace text entrance animation
const oldTextTransition = `transition={{
                      duration: 0.6,
                      delay: lineIndex * 0.15,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}`;
const newTextTransition = `transition={{
                      duration: 0.8,
                      delay: lineIndex * 0.2,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}`;
code = code.replace(oldTextTransition, newTextTransition);

// Replace highlight animation
const oldHighlight = `<motion.div 
                    initial={{ left: 0, width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.3 + lineIndex * 0.45, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 left-0 bg-[#c084fc]/80 z-0 rounded-lg shadow-sm"
                  />`;

const newHighlight = `<motion.div 
                    initial={{ left: 0, width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 0.5 + lineIndex * 1.0, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 left-0 bg-[#c084fc]/80 z-0 rounded-lg shadow-sm"
                  />`;
                  
code = code.replace(oldHighlight, newHighlight);

fs.writeFileSync('src/components/Login.tsx', code);
