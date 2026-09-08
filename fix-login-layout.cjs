const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const navRegex = /<nav className="fixed top-0 inset-x-0 z-50 flex flex-col items-center px-4 py-3 bg-neutral-950\/80 backdrop-blur-md border-b border-neutral-800">[\s\S]*?<\/nav>/;

const newNav = `<nav className="fixed top-0 inset-x-0 z-50 flex flex-col items-center px-4 py-3 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="w-full max-w-7xl flex items-center justify-between relative">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="https://i.postimg.cc/gX1nxKHH/logo.png" alt="MecoPay" className="h-8 sm:h-9 w-auto rounded-xl shadow-sm" onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/Zn53D792/Meco-Pay-Logo.png"; }} />
            <span className="text-base sm:text-xl font-bold text-white tracking-tight">MecoPay</span>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 text-neutral-300 hover:text-white px-2 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Sign In
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              Sign Up <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mt-3 text-sm md:text-base font-semibold text-neutral-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#developers" className="hover:text-white transition-colors">Developers</a>
        </div>
      </nav>`;

code = code.replace(navRegex, newNav);

fs.writeFileSync('src/components/Login.tsx', code);
