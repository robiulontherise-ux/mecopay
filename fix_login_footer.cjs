const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const oldFooterLinks = `<div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-4 text-sm font-semibold">
          <a href="/privacy-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Privacy Policy</a>
          <a href="/terms-conditions" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Terms & Conditions</a>
          <a href="/refund-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Refund Policy</a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-sm font-semibold">
          <a href="/customer-rights" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Customer Rights</a>
          <a href="/anti-fraud" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Anti Fraud Policy</a>
        </div>`;

const newFooterLinks = `<div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-sm font-semibold">
          <a href="/privacy-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Privacy Policy</a>
          <a href="/terms-conditions" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Terms & Conditions</a>
          <a href="/refund-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Refund Policy</a>
          <a href="/anti-fraud" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Customer Rights & Anti Fraud Policy</a>
        </div>`;

if(code.includes('Customer Rights')) {
    code = code.replace(oldFooterLinks, newFooterLinks);
} else {
    // maybe old structure?
    const veryOldFooter = `<div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-sm font-semibold">
          <a href="/privacy-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Privacy Policy</a>
          <a href="/terms-conditions" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Terms & Conditions</a>
          <a href="/refund-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Refund Policy</a>
        </div>`;
    code = code.replace(veryOldFooter, newFooterLinks);
}

// Now revert the highlight color logic and fix font size
const oldRenderBlockStart = "              {textChunks[currentChunk] && textChunks[currentChunk].map((line, lineIndex) => {";
const oldRenderBlockMatch = code.match(/\{textChunks\[currentChunk\] && textChunks\[currentChunk\]\.map\(\(line, lineIndex\) => \{[\s\S]*?\)\}\)}\n            <\/motion.div>/);

const newRenderBlock = `{textChunks[currentChunk] && textChunks[currentChunk].map((line, lineIndex) => {
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
                    className={\`inline-block relative z-10 text-white drop-shadow-md px-1 md:px-2 leading-tight md:leading-relaxed \${isLongText ? 'text-[14px] xs:text-base sm:text-lg md:text-xl lg:text-2xl mt-0.5' : ''}\`}
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
              )})}
            </motion.div>`;

if (oldRenderBlockMatch) {
  code = code.replace(oldRenderBlockMatch[0], newRenderBlock);
}

fs.writeFileSync('src/components/Login.tsx', code);
console.log('Login footer & render fixed');
