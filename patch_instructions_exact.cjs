const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

// The new visual that matches the actual apps better
const newInstructionVisual = `<div className="ml-7 my-4 border-2 border-white/20 rounded-xl overflow-hidden bg-white flex justify-center items-center py-6 relative shadow-inner">
                        {/* Arrow SVG pointing to Send Money */}
                        <div className="absolute top-2 left-1/2 -translate-x-4 w-16 h-16 z-10 pointer-events-none animate-bounce">
                           <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                             <path d="M80 10 C 60 10, 30 30, 20 60" stroke={providerKey === 'nagad' ? '#000000' : providerKey === 'upay' ? '#0033A0' : '#E2136E'} strokeWidth="6" strokeLinecap="round" fill="none" />
                             <path d="M10 50 L 20 65 L 35 55" stroke={providerKey === 'nagad' ? '#000000' : providerKey === 'upay' ? '#0033A0' : '#E2136E'} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                           </svg>
                        </div>
                        
                        <div className="flex gap-4 relative z-0">
                           <div className="flex flex-col items-center gap-1 relative">
                              <div className={\`w-14 h-14 rounded-full border-2 \${providerKey === 'nagad' ? 'border-red-500 bg-red-50' : providerKey === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-blue-500 bg-blue-50'} flex items-center justify-center\`}>
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={\`\${providerKey === 'nagad' ? 'text-red-500' : providerKey === 'bkash' ? 'text-pink-500' : 'text-blue-500'}\`}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                              </div>
                              <div className="text-[11px] text-slate-800 font-bold mt-1">সেন্ড মানি</div>
                           </div>
                           <div className="flex flex-col items-center gap-1 opacity-60">
                              <div className="w-14 h-14 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                              </div>
                              <div className="text-[11px] text-slate-800 font-bold mt-1">মোবাইল রিচার্জ</div>
                           </div>
                           <div className="flex flex-col items-center gap-1 opacity-60">
                              <div className="w-14 h-14 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                              </div>
                              <div className="text-[11px] text-slate-800 font-bold mt-1">ক্যাশ আউট</div>
                           </div>
                        </div>
                     </div>`;

// Replace in Step 4
content = content.replace(
  /<div className="ml-7 my-4 border-2 border-white\/20 rounded-xl overflow-hidden bg-white flex justify-center items-center py-6 relative">[\s\S]*?<div className="text-center font-bold mb-4 text-lg">ট্রানজেকশন আইডি দিন<\/div>/g,
  newInstructionVisual + `\n                      <div className="text-center font-bold mb-4 text-lg mt-8">ট্রানজেকশন আইডি দিন</div>`
);

// Replace in Step 5
content = content.replace(
  /<div className="ml-7 my-4 border-2 border-white\/20 rounded-xl overflow-hidden bg-white flex justify-center items-center py-4">[\s\S]*?<p className="flex gap-2 items-start"><span className="bg-white text-black font-bold w-5 h-5 flex items-center justify-center rounded-full text-\[10px\] shrink-0 mt-0\.5">3<\/span>/g,
  newInstructionVisual + `\n                     <p className="flex gap-2 items-start"><span className="bg-white text-black font-bold w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">3</span>`
);

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched instruction visuals perfectly");
