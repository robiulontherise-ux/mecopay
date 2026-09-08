const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// 1. Hero text size and full width
const oldHeroSection = `className="relative z-10 pt-40 pb-20 px-6 text-center max-w-6xl mx-auto flex flex-col items-center"`;
const newHeroSection = `className="relative z-10 pt-40 pb-20 px-0 sm:px-6 text-center max-w-6xl mx-auto flex flex-col items-center"`;
code = code.replace(oldHeroSection, newHeroSection);

const oldTextContainer = `className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-[14px] xs:text-base sm:text-xl md:text-3xl lg:text-4xl font-extrabold leading-relaxed md:leading-tight mb-12 max-w-7xl mx-auto w-full px-2 relative overflow-hidden"`;
const newTextContainer = `className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-[18px] xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-relaxed md:leading-tight mb-12 max-w-7xl mx-auto w-full px-0 sm:px-2 relative overflow-hidden"`;
code = code.replace(oldTextContainer, newTextContainer);

// Make button container full width on mobile
const oldBtnContainer = `className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"`;
const newBtnContainer = `className="flex flex-col sm:flex-row items-center gap-4 w-[90%] sm:w-auto"`;
code = code.replace(oldBtnContainer, newBtnContainer);

// 2. Feature page text size
const oldFeaturesH2 = `className="text-3xl md:text-4xl font-bold text-white mb-20 tracking-tight text-center"`;
const newFeaturesH2 = `className="text-4xl md:text-5xl font-bold text-white mb-20 tracking-tight text-center"`;
code = code.replace(oldFeaturesH2, newFeaturesH2);

// Leaf Nodes
code = code.replace(/text-lg sm:text-2xl md:text-3xl text-center/g, 'text-xl sm:text-3xl md:text-4xl text-center');

// Marquee
const oldMarquee = `text-lg md:text-2xl font-bold text-neutral-300`;
const newMarquee = `text-xl md:text-3xl font-bold text-neutral-300`;
code = code.replace(new RegExp(oldMarquee, 'g'), newMarquee);

// Feature cards
const oldCardH3 = `text-xl md:text-2xl font-bold text-white mb-4`;
const newCardH3 = `text-2xl md:text-3xl font-bold text-white mb-4`;
code = code.replace(new RegExp(oldCardH3, 'g'), newCardH3);

const oldCardP = `text-base text-neutral-400 leading-relaxed`;
const newCardP = `text-lg text-neutral-400 leading-relaxed`;
code = code.replace(new RegExp(oldCardP, 'g'), newCardP);

// 3. Footer buttons
const oldFooter = `      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-10 text-center mt-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-neutral-500" />
          <span className="text-lg font-bold text-neutral-500">MecoPay</span>
        </div>
        <p className="text-sm text-neutral-600">© {new Date().getFullYear()} MecoPay Framework. All rights reserved.</p>
      </footer>`;

const newFooter = `      {/* Footer */}
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
code = code.replace(oldFooter, newFooter);

fs.writeFileSync('src/components/Login.tsx', code);
