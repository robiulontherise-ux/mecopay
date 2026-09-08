const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

const toReplace = `</div>
                      <div className="text-center font-bold mb-4 text-lg mt-8">ট্রানজেকশন আইডি দিন</div>`;

const replacement = `<p className="flex gap-2 mt-4"><span className="bg-white text-black font-bold w-5 h-5 flex items-center justify-center rounded-full text-xs shrink-0">3</span> একাউন্ট নম্বর পেস্ট করুন এবং কাঙ্ক্ষিত এমাউন্ট ({linkData?.price} BDT) সেন্ড মানি করুন।</p>
                         <p className="flex gap-2 mt-4"><span className="bg-white text-black font-bold w-5 h-5 flex items-center justify-center rounded-full text-xs shrink-0">4</span> সেন্ড মানি সম্পন্ন করে ট্রানজেকশন আইডি (TrxID) নিচের বক্সে দিন এবং VERIFY বাটনে ক্লিক করুন।</p>
                      </div>
                      <div className="text-center font-bold mb-4 text-lg mt-8">ট্রানজেকশন আইডি দিন</div>`;

content = content.replace(toReplace, replacement);

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Put back instructions 3 and 4");
