const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

const oldInstructionVisual = `<div className="ml-7 my-4 border-2 border-white/20 rounded-xl overflow-hidden bg-white flex justify-center items-center py-4">
                        {/* Generic visual representation of an app menu since we don't have the real image asset */}
                        <div className="flex gap-4">
                           <div className="flex flex-col items-center gap-1">
                              <div className={\`w-12 h-12 rounded-full border-2 \${providerKey === 'nagad' ? 'border-red-500 bg-red-50' : providerKey === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-blue-500 bg-blue-50'} flex items-center justify-center animate-pulse\`}>
                                 <ShoppingCart className={\`w-5 h-5 \${providerKey === 'nagad' ? 'text-red-500' : providerKey === 'bkash' ? 'text-pink-500' : 'text-blue-500'}\`} />
                              </div>
                              <div className="text-[10px] text-slate-800 font-bold">সেন্ড মানি</div>
                           </div>
                           <div className="flex flex-col items-center gap-1 opacity-40 grayscale">
                              <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                                 <RefreshCw className="w-5 h-5 text-slate-500" />
                              </div>
                              <div className="text-[10px] text-slate-800 font-bold">ক্যাশ আউট</div>
                           </div>
                           <div className="flex flex-col items-center gap-1 opacity-40 grayscale">
                              <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                                 <Lock className="w-5 h-5 text-slate-500" />
                              </div>
                              <div className="text-[10px] text-slate-800 font-bold">পেমেন্ট</div>
                           </div>
                        </div>
                     </div>`;

const newInstructionVisual = `<div className="ml-7 my-4 border-2 border-white/20 rounded-xl overflow-hidden bg-white flex justify-center items-center py-6 relative">
                        {/* Arrow SVG pointing to Send Money */}
                        <div className="absolute top-2 left-1/2 -translate-x-4 w-16 h-16 z-10 pointer-events-none">
                           <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                             <path d="M80 10 C 60 10, 30 30, 20 60" stroke={providerKey === 'nagad' ? '#000000' : providerKey === 'upay' ? '#0033A0' : '#E2136E'} strokeWidth="6" strokeLinecap="round" fill="none" />
                             <path d="M10 50 L 20 65 L 35 55" stroke={providerKey === 'nagad' ? '#000000' : providerKey === 'upay' ? '#0033A0' : '#E2136E'} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                           </svg>
                        </div>
                        
                        <div className="flex gap-4 relative z-0">
                           <div className="flex flex-col items-center gap-1 relative">
                              <div className={\`w-14 h-14 rounded-full border-2 \${providerKey === 'nagad' ? 'border-red-500 bg-red-50' : providerKey === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-blue-500 bg-blue-50'} flex items-center justify-center\`}>
                                 <ShoppingCart className={\`w-6 h-6 \${providerKey === 'nagad' ? 'text-red-500' : providerKey === 'bkash' ? 'text-pink-500' : 'text-blue-500'}\`} />
                              </div>
                              <div className="text-[11px] text-slate-800 font-bold mt-1">সেন্ড মানি</div>
                           </div>
                           <div className="flex flex-col items-center gap-1 opacity-60">
                              <div className="w-14 h-14 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                                 <RefreshCw className="w-6 h-6 text-slate-500" />
                              </div>
                              <div className="text-[11px] text-slate-800 font-bold mt-1">ক্যাশ আউট</div>
                           </div>
                           <div className="flex flex-col items-center gap-1 opacity-60">
                              <div className="w-14 h-14 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                                 <Lock className="w-6 h-6 text-slate-500" />
                              </div>
                              <div className="text-[11px] text-slate-800 font-bold mt-1">পেমেন্ট</div>
                           </div>
                        </div>
                     </div>`;

content = content.replace(oldInstructionVisual, newInstructionVisual);
content = content.replace(oldInstructionVisual, newInstructionVisual); // replace both step 4 and step 5 if it exists in both, wait it only exists in step 5 right now!

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched instruction visual");
