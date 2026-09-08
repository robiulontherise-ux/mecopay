const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// Replace the messed up block from <nav ...> up to </section> before Features Section
const brokenBlockRegex = /<nav className="fixed top-0 inset-x-0 z-50 flex flex-col items-center px-4 py-3 bg-neutral-950\/80 backdrop-blur-md border-b border-neutral-800">[\s\S]*?<\/section>/;

const fixedBlock = `<nav className="fixed top-0 inset-x-0 z-50 flex flex-col items-center px-4 py-3 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="w-full max-w-7xl flex items-center justify-between relative">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="https://i.postimg.cc/gX1nxKHH/logo.png" alt="MecoPay" className="h-8 sm:h-9 w-auto rounded-xl shadow-sm" onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/Zn53D792/Meco-Pay-Logo.png"; }} />
            <span className="text-[18px] sm:text-xl font-bold text-white tracking-tight">MecoPay</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all shadow-sm"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6 sm:gap-10 mt-3 text-[15px] sm:text-[17px] font-bold text-neutral-300">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#developers" className="hover:text-white transition-colors">Developers</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative z-10 pt-40 pb-20 px-6 text-center max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Animated Bengali Text */}
        <div className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-relaxed md:leading-tight mb-12 max-w-7xl mx-auto w-full px-2 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentChunk}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-2 md:space-y-4 w-full text-center"
            >
              {textChunks[currentChunk] && textChunks[currentChunk].map((line, lineIndex) => (
                <div key={lineIndex} className="relative inline-block overflow-hidden py-1">
                  <motion.span
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: lineIndex * 0.15,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="inline-block relative z-10 bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent drop-shadow-sm px-2"
                  >
                    {line}
                  </motion.span>
                  
                  {lineIndex === 1 && (
                    <motion.div 
                      initial={{ left: 0, width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.6, delay: lineIndex * 0.6, ease: "easeInOut" }}
                      className="absolute top-0 bottom-0 left-0 bg-[#c084fc]/90 z-0 rounded-lg shadow-sm"
                    />
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={handleGoogleLogin}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-sm group"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          
          <a 
            href="#" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-xl text-base font-medium transition-all border border-neutral-800 group"
          >
            <PlayCircle className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="flex flex-col items-start text-left">
               <span className="text-sm leading-tight text-white font-semibold">Watch Video</span>
               <span className="text-[11px] text-neutral-500 font-medium leading-tight mt-0.5">How it works & API</span>
            </span>
          </a>
        </div>
      </section>`;

code = code.replace(brokenBlockRegex, fixedBlock);
fs.writeFileSync('src/components/Login.tsx', code);
