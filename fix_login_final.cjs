const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// 1. Revert text size
code = code.replace("text-[19px] xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl", "text-[17px] xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl");

// 2. Revert the render block
const renderStart = "              {textChunks[currentChunk] && textChunks[currentChunk].map((line, lineIndex) => {";
const renderEnd = "              )})}";

const newRender = `              {textChunks[currentChunk] && textChunks[currentChunk].map((line, lineIndex) => (
                <div key={lineIndex} className="relative inline-block py-2 px-1">
                  <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: lineIndex * 0.2,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="inline-block relative z-10 text-white drop-shadow-md px-1 md:px-2 leading-relaxed"
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
const afterParts = parts[1].split(renderEnd);
code = parts[0] + newRender + afterParts.slice(1).join(renderEnd);

// 3. Revert marquee
const newMarqueeText = "১. পার্সোনাল MFS: যাদের Trade License বা TIN Certificate নেই তাদের জন্য। <span className=\"mx-8 text-pink-500/50\">•</span> ২. মার্চেন্ট MFS/Bank/Card: আনলিমিটেড পেমেন্ট রিসিভ ও অ্যাডভান্স পেমেন্ট। <span className=\"mx-8 text-pink-500/50\">•</span> ৩. বাংলা QR: ফিজিক্যাল শপ বা শোরুমে পেমেন্ট নিন। <span className=\"mx-8 text-pink-500/50\">•</span> ৪. No-Code ওয়েবসাইট: কোনো কোডিং ছাড়াই ই-কমার্স সাইট তৈরি করুন। <span className=\"mx-8 text-pink-500/50\">•</span>";
const oldMarqueeText = "১. পার্সোনাল MFS: যাদের Trade License বা TIN Certificate নেই তাদের জন্য। ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল, ফ্রড অর্ডার কমাতে অ্যাডভান্স পেমেন্ট রিসিভ করুন। <span className=\"mx-8 text-pink-500/50\">•</span> ২. মার্চেন্ট MFS/Bank/Card: Trade License ধারীদের জন্য। আনলিমিটেড পেমেন্ট রিসিভ, ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল এবং অ্যাডভান্স পেমেন্ট সিস্টেম। <span className=\"mx-8 text-pink-500/50\">•</span> ৩. বাংলা QR: ফিজিক্যাল শপ বা শোরুমে বাংলা QR দিয়ে পেমেন্ট নিন ও ডিজিটাল হিসাব রাখুন। ফিজিক্যাল শপের পাশাপাশি অনলাইনেও সেল ও আইডেন্টিটি তৈরি করুন। <span className=\"mx-8 text-pink-500/50\">•</span>";

code = code.replace(newMarqueeText, oldMarqueeText);
code = code.replace(newMarqueeText, oldMarqueeText);

// 4. Add the 2 footer links back
const oldFooterLinks = `<div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-sm font-semibold">
          <a href="/privacy-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Privacy Policy</a>
          <a href="/terms-conditions" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Terms & Conditions</a>
          <a href="/refund-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Refund Policy</a>
        </div>`;

const newFooterLinks = `<div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-4 text-sm font-semibold">
          <a href="/privacy-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Privacy Policy</a>
          <a href="/terms-conditions" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Terms & Conditions</a>
          <a href="/refund-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Refund Policy</a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-sm font-semibold">
          <a href="/customer-rights" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Customer Rights</a>
          <a href="/anti-fraud" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Anti Fraud Policy</a>
        </div>`;

code = code.replace(oldFooterLinks, newFooterLinks);

fs.writeFileSync('src/components/Login.tsx', code);
console.log('Login fully restored and fixed!');
