const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const regex = /<button\s+onClick=\{\(\) => \{ setVerifyMethod\('live'\); setStep\(4\); \}\}[\s\S]*?<\/button>\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}/;

const newButtons = `<div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 shadow-inner">
                    <button 
                      onClick={() => { setVerifyMethod('live'); setStep(4); }}
                      className="w-full text-left bg-white hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-xl p-5 transition-all relative overflow-hidden group shadow-sm mb-2"
                    >
                      <div className="absolute top-0 right-0 bg-[#00E5FF] text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">RECOMMENDED</div>
                      <div className="flex items-center gap-4 mb-2 mt-1">
                        <div className="bg-blue-600 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                          <RefreshCw className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 text-xl tracking-tight">Live Auto-Verification</span>
                      </div>
                      <p className="text-sm text-slate-600 ml-[52px] leading-relaxed">
                        {lang === 'EN' 
                           ? 'Select this method, enter your sender number on the next page and confirm. A 10-min live session will start, send money within this time to auto-verify.' 
                           : 'লাইভ মেথড সিলেক্ট করলে, পরের পেইজে আপনি যে একাউন্ট নম্বর থেকে টাকা পাঠাবেন সেটি দিয়ে নিশ্চিত করলে ১০ মিনিটের লাইভ সেশন চালু হবে। এর মধ্যে সেন্ড মানি করলেই পেমেন্ট অটো ভেরিফাই হবে।'}
                      </p>
                    </button>

                    <div className="h-px bg-slate-200 mx-4 my-1"></div>

                    <button 
                      onClick={() => { setVerifyMethod('trxid'); setStep(4); }}
                      className="w-full text-left bg-white hover:bg-slate-100 border border-transparent hover:border-slate-300 rounded-xl p-5 transition-all shadow-sm group mt-2"
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <div className="bg-slate-700 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                          <Clock className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 text-xl tracking-tight">TrxID Verification</span>
                      </div>
                      <p className="text-sm text-slate-600 ml-[52px] leading-relaxed">
                        {lang === 'EN' 
                           ? 'Cash In from a shop or ask someone else to Send Money. Then verify using the Transaction ID (TrxID).' 
                           : 'দোকান থেকে ক্যাশ-ইন করুন বা দূরের কাউকে দিয়ে সেন্ড মানি করান। এরপর ট্রানজেকশন আইডি (TrxID) দিয়ে ভেরিফাই করুন।'}
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}`;

content = content.replace(regex, newButtons);
fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log('Patched step 3 design');
