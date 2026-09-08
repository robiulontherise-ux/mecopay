const fs = require('fs');
let code = fs.readFileSync('src/components/Legal.tsx', 'utf-8');

const regex = /<h2 className="text-2xl font-bold text-white mb-4">১\.২\. পাসওয়ার্ডলেস লগইন এবং ডিভাইস সিকিউরিটি<\/h2>[\s\S]*?<\/section>/;

const newContent = `<h2 className="text-2xl font-bold text-white mb-4">১.২. টু-ফ্যাক্টর অথেনটিকেশন (2FA) এবং অ্যাকাউন্ট সুরক্ষা</h2>
        <p>MecoPay-তে গ্রাহকদের সর্বোচ্চ নিরাপত্তা নিশ্চিত করতে টু-ফ্যাক্টর অথেনটিকেশন (2-Step Verification) ব্যবস্থা রয়েছে।</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>অ্যাক্সেস সুরক্ষা:</strong> আমাদের প্ল্যাটফর্মে লগইন করার পর আপনি 2-Step Verification চালু করতে পারবেন। এর ফলে, কেউ যদি আপনার অ্যাকাউন্টের পাসওয়ার্ড জেনেও ফেলে, তবুও 2-Step ভেরিফিকেশন ছাড়া সে কোনোভাবেই আপনার অ্যাকাউন্টে প্রবেশ করতে পারবে না।</li>
          <li><strong>বায়োমেট্রিক রিকমেন্ডেশন:</strong> আপনার অ্যাকাউন্টকে সম্পূর্ণ সুরক্ষিত রাখতে আমরা 2-Step Verification-এর ক্ষেত্রে ফিঙ্গারপ্রিন্ট (Fingerprint) বা বায়োমেট্রিক অপশন ব্যবহারের জন্য জোর সুপারিশ করছি। এটি আপনার অ্যাকাউন্টের অননুমোদিত অ্যাক্সেস কার্যকরভাবে প্রতিরোধ করবে।</li>
        </ul>
      </section>`;

if (regex.test(code)) {
  code = code.replace(regex, newContent);
  fs.writeFileSync('src/components/Legal.tsx', code);
  console.log("Legal policy updated.");
} else {
  console.log("Regex not matched.");
}
