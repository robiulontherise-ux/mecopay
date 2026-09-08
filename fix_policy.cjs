const fs = require('fs');
let code = fs.readFileSync('src/components/Legal.tsx', 'utf-8');

const oldPolicy = `<h2 className="text-2xl font-bold text-white mb-4">১.২. পাসওয়ার্ডলেস লগইন এবং ডিভাইস সিকিউরিটি</h2>
        <p>MecoPay-তে কোনো সনাতন ইমেইল এবং পাসওয়ার্ড সিস্টেম নেই। পাসওয়ার্ড চুরি হওয়ার কোনো ঝুঁকি আমাদের প্ল্যাটফর্মে নেই।</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>গুগল লগইন:</strong> অ্যাকাউন্টে প্রবেশ করতে হলে শুধুমাত্র নির্দিষ্ট ডিভাইসে সিঙ্ক করা ভেরিফায়েড গুগল অ্যাকাউন্ট (Google Account) দিয়ে লগইন করতে হবে।</li>
          <li><strong>অ্যাক্সেস সুরক্ষা:</strong> কেউ আপনার ইমেইল জেনে ফেললেও, ভেরিফায়েড ডিভাইস এবং গুগল অ্যাকাউন্টের অ্যাক্সেস ছাড়া সে কোনোভাবেই আপনার MecoPay অ্যাকাউন্টে প্রবেশ করতে পারবেবিধা নেই।</li>
        </ul>`; // Wait, I might not have the exact text.

// I will use regex to replace the section.
