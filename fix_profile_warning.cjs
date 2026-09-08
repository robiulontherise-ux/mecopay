const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const oldWarningBlock = `<div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                    <div className="text-sm text-red-200">
                      <p className="font-bold text-red-400 mb-1">CRITICAL WARNING</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong>১৮ বছরের উপরে হলে NID এবং Birth Certificate উভয়ই বাধ্যতামূলক।</strong></li>
                        <li>১৮ বছরের নিচে হলে শুধুমাত্র Birth Certificate বাধ্যতামূলক।</li>
                        <li className="text-amber-400 mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded font-medium">আপনার বয়স যদি ১৮ বছরের উপরে হয়, কিন্তু আপনি NID প্রদান এড়ানোর জন্য তা উল্লেখ না করেন, তবে আমরা যাচাই করে দেখলে আপনার অ্যাকাউন্ট ভেরিফাই হবে না এবং আমরা অ্যাকাউন্ট বাতিল বা ব্লক করবো।</li>
                        <li className="text-red-400 mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded font-bold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">একই আইডেন্টিটি দিয়ে একাধিকবার অ্যাকাউন্ট খোলার চেষ্টা করলে অথবা আমাদের প্ল্যাটফর্ম ব্যবহার করে কোনো কাস্টমারের কাছ থেকে অ্যাডভান্স পেমেন্ট নিয়ে প্রতারণা করলে, আপনার অ্যাকাউন্ট স্থায়ীভাবে ব্লক করে দেওয়া হবে এবং ভোক্তা অধিকার সংরক্ষণ আইন ও সাইবার নিরাপত্তা আইনে সরাসরি মামলা দায়ের করা হবে। প্রমাণ যাচাই করে ক্লায়েন্টকে জানিয়ে, ফোন বা ইমেইলে যোগাযোগ করেই ব্যান করা হবে।</li>
                      </ul>
                    </div>
                  </div>
                </div>`;

const newWarningBlock = `<div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-6 mb-6 -mx-2 sm:mx-0">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4 mb-6">
                  <div className="flex gap-2 sm:gap-3">
                    <ShieldAlert className="w-4 sm:w-5 h-4 sm:h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-[13px] sm:text-sm text-red-200">
                      <p className="font-bold text-red-400 mb-2">CRITICAL WARNING</p>
                      <ul className="list-disc pl-3 sm:pl-4 space-y-2">
                        <li><strong>১৮ বছরের উপরে হলে NID এবং Birth Certificate উভয়ই বাধ্যতামূলক।</strong></li>
                        <li>১৮ বছরের নিচে হলে শুধুমাত্র Birth Certificate বাধ্যতামূলক।</li>
                        <li className="text-amber-400 mt-2 p-2 sm:p-2.5 bg-amber-500/10 border border-amber-500/20 rounded font-medium leading-relaxed">আপনার বয়স ১৮ বছরের বেশি হওয়া সত্ত্বেও (যা বার্থ সার্টিফিকেটে উল্লেখিত) যদি আপনি তা গোপন করে '১৮ বছরের নিচে' নির্বাচন করেন, তবে যাচাইকরণ সাপেক্ষে অ্যাকাউন্টটি ভেরিফাই করা হবে না এবং প্ল্যাটফর্মের নীতিমালা অনুযায়ী তা স্থগিত (Suspend) করা হতে পারে।</li>
                        <li className="text-red-400 mt-2 p-2 sm:p-2.5 bg-red-500/10 border border-red-500/30 rounded font-bold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)] leading-relaxed">একই আইডেন্টিটি দিয়ে একাধিক অ্যাকাউন্ট খোলার চেষ্টা বা আমাদের প্ল্যাটফর্মের মাধ্যমে কোনো কাস্টমারের সাথে প্রতারণা প্রমাণিত হলে অ্যাকাউন্টটি স্থায়ীভাবে বাতিল (Permanent Ban) করা হবে। এছাড়াও, প্রচলিত আইন অনুযায়ী ব্যবস্থা গ্রহণ করা হবে। যথাযথ প্রমাণের ভিত্তিতে ইমেইল বা ফোনের মাধ্যমে পূর্ব-নোটিশ প্রদান সাপেক্ষে এই সিদ্ধান্ত কার্যকর হবে।</li>
                      </ul>
                    </div>
                  </div>
                </div>`;

code = code.replace(oldWarningBlock, newWarningBlock);
fs.writeFileSync('src/components/DashboardShell.tsx', code);
console.log('Profile warning fixed');
