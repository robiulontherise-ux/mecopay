const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// 1. Fix the text cutoff by adding more bottom padding to the hidden overflow container
const oldLineClass = `className="relative inline-block overflow-hidden py-1"`;
const newLineClass = `className="relative inline-block overflow-hidden pt-1 pb-4 px-1"`;
code = code.replace(oldLineClass, newLineClass);

// Make text bold and larger on mobile
const oldTextContainer = `className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-relaxed md:leading-tight mb-12 max-w-7xl mx-auto w-full px-0 sm:px-2 relative"`;
const newTextContainer = `className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-[22px] xs:text-[26px] sm:text-3xl md:text-4xl lg:text-5xl font-black leading-loose md:leading-normal mb-12 max-w-7xl mx-auto w-full px-0 sm:px-2 relative"`;
code = code.replace(oldTextContainer, newTextContainer);

// Make the text span inherit leading correctly
const oldSpanClass = `className="inline-block relative z-10 text-white drop-shadow-md px-2"`;
const newSpanClass = `className="inline-block relative z-10 text-white drop-shadow-md px-1 md:px-2 leading-relaxed"`;
code = code.replace(oldSpanClass, newSpanClass);

// 2. Feature page adjustments
const oldFeaturesH2 = `className="text-4xl md:text-5xl font-bold text-white mb-20 tracking-tight text-center"`;
const newFeaturesH2 = `className="text-4xl md:text-6xl font-black text-white mb-20 tracking-tight text-center"`;
code = code.replace(oldFeaturesH2, newFeaturesH2);

// Leaf Nodes
code = code.replace(/text-xl sm:text-3xl md:text-4xl text-center/g, 'text-2xl sm:text-4xl md:text-5xl text-center font-black');

// Marquee
const oldMarquee = `text-xl md:text-3xl font-bold text-neutral-300`;
const newMarquee = `text-2xl md:text-4xl font-bold text-neutral-300`;
code = code.replace(new RegExp(oldMarquee, 'g'), newMarquee);

// Feature cards
const oldCardH3 = `text-2xl md:text-3xl font-bold text-white mb-4`;
const newCardH3 = `text-3xl md:text-4xl font-black text-white mb-4`;
code = code.replace(new RegExp(oldCardH3, 'g'), newCardH3);

const oldCardP = `text-lg text-neutral-400 leading-relaxed`;
const newCardP = `text-xl text-neutral-400 leading-relaxed`;
code = code.replace(new RegExp(oldCardP, 'g'), newCardP);

// 3. Footer buttons
const oldFooter = `      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-10 text-center mt-12">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm font-medium text-neutral-400">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
          <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
          <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-neutral-500" />
          <span className="text-lg font-bold text-neutral-500">MecoPay</span>
        </div>
        <p className="text-sm text-neutral-600">© {new Date().getFullYear()} MecoPay Framework. All rights reserved.</p>
      </footer>`;

const newFooter = `      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-10 text-center mt-12">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-sm font-semibold">
          <a href="#" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Privacy Policy</a>
          <a href="#" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Terms & Conditions</a>
          <a href="#" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Refund Policy</a>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-neutral-500" />
          <span className="text-lg font-bold text-neutral-500">MecoPay</span>
        </div>
        <p className="text-sm text-neutral-600">© {new Date().getFullYear()} MecoPay Framework. All rights reserved.</p>
      </footer>`;
code = code.replace(oldFooter, newFooter);

fs.writeFileSync('src/components/Login.tsx', code);
