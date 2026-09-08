const fs = require('fs');

const content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const regex = /<img\s+src=\{`\/shapeshifter-rounded-\$\{providerKey\.charAt\(0\)\.toUpperCase\(\) \+ providerKey\.slice\(1\)\}\.png`\}\s+alt=\{`\$\{selectedGateway\.provider\} Instructions`\}\s+className="w-full max-w-\[280px\] h-auto object-contain"\s+\/>/;

const replacement = `<div className="flex gap-4 relative z-0">
                           <div className="flex flex-col items-center gap-1 relative">
                              <div className={\`w-14 h-14 rounded-full border-2 \${providerKey === 'nagad' ? 'border-red-500 bg-red-50' : providerKey === 'bkash' ? 'border-pink-500 bg-pink-50' : providerKey === 'rocket' ? 'border-purple-600 bg-purple-50' : 'border-blue-500 bg-blue-50'} flex items-center justify-center\`}>
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={\`\${providerKey === 'nagad' ? 'text-red-500' : providerKey === 'bkash' ? 'text-pink-500' : providerKey === 'rocket' ? 'text-purple-600' : 'text-blue-500'}\`}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
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
                        </div>`;

if (regex.test(content)) {
  fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content.replace(regex, replacement));
  console.log("Patched successfully!");
} else {
  console.log("Regex didn't match.");
}
