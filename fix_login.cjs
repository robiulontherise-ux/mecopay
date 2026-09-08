const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// The new marquee text is already correct but we might need to adjust the highlighting animation.
const renderStart = "              {textChunks[currentChunk] && textChunks[currentChunk].map((line, lineIndex) => (";
const renderEnd = "              ))}";

const newRender = `              {textChunks[currentChunk] && textChunks[currentChunk].map((line, lineIndex) => (
                <div key={lineIndex} className="relative inline-block py-2 px-2">
                  <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: lineIndex * 0.2,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="inline-block relative z-10 text-white drop-shadow-md px-1 md:px-2 leading-relaxed whitespace-pre-wrap"
                  >
                    {line}
                  </motion.span>
                  <motion.div 
                    initial={{ left: 0, width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.0, delay: 0.5 + lineIndex * 2.0, ease: "easeInOut" }}
                    className="absolute top-1 bottom-1 left-0 bg-[#c084fc]/80 z-0 rounded-lg shadow-sm"
                  />
                </div>
              ))}`;

const parts = code.split(renderStart);
if (parts.length > 1) {
  const afterParts = parts[1].split(renderEnd);
  code = parts[0] + newRender + afterParts.slice(1).join(renderEnd);
  fs.writeFileSync('src/components/Login.tsx', code);
  console.log('Login render fixed!');
} else {
  console.log('Could not find render section.');
}
