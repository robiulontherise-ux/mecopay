const fs = require('fs');
let code = fs.readFileSync('src/components/Legal.tsx', 'utf-8');

const oldAntiFraudMatch = code.match(/export const CustomerRightsAndAntiFraud = \(\) => \([\s\S]*?<\/LegalLayout>\n\);/);

const newAntiFraud = `export const CustomerRightsAndAntiFraud = () => (
  <LegalLayout title="Anti-Fraud & Customer Rights" icon={ShieldCheck} lastUpdated="৩ আগস্ট ২০২৬">
    <div className="space-y-8">
      <section>
        <p>আমরা কাস্টমারদের অধিকার রক্ষায় জিরো-টলারেন্স নীতি মেনে চলি। MecoPay-এর পেমেন্ট চেকআউট পেজে একটি সরাসরি <strong>'রিপোর্ট' (Report)</strong> বাটন রয়েছে। কাস্টমার প্রতারিত হলে এই বাটনের মাধ্যমে প্রমাণাদিসহ সরাসরি আমাদের কাছে অভিযোগ জানাতে পারবেন।</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">১. ডেলিভারি যাচাইকরণ প্রক্রিয়া</h2>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>ফিজিক্যাল প্রোডাক্ট (Physical Products):</strong> ক্লায়েন্ট কাস্টম ওয়েবসাইট বা আমাদের নো-কোড ওয়েবসাইট (No-code website) সিস্টেম ব্যবহার করুক না কেন, ফিজিক্যাল প্রোডাক্টের ক্ষেত্রে ডেলিভারি API (কুরিয়ার এপিআই) কানেক্ট করা বাধ্যতামূলক। আমাদের মাদার ব্যাকএন্ড সরাসরি কুরিয়ার এপিআই থেকে ডেটা রিড করে রিয়েল-টাইমে যাচাই করবে যে প্রোডাক্ট কাস্টমারের কাছে সফলভাবে ডেলিভারি হয়েছে কিনা।</li>
          <li><strong>ডিজিটাল প্রোডাক্ট (Digital Products):</strong> ডিজিটাল প্রোডাক্ট বা সার্ভিসের ক্ষেত্রে অভিযোগ আসলে, আমরা উভয় পক্ষের (ক্রেতা এবং বিক্রেতা) স্ক্রিনশট, ব্র্যান্ড ডেটা এবং সার্ভার লগ ক্রস-চেক করে ম্যানুয়ালি যাচাই করব কে সত্য বলছে।</li>
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">২. প্রতারণার শাস্তি এবং আইনি ব্যবস্থা</h2>
        <p>প্রমাণ যাচাইয়ের পর যদি প্রমাণিত হয় যে কোনো মার্চেন্ট বা ক্লায়েন্ট কাস্টমারের কাছ থেকে অগ্রিম টাকা নিয়ে ফিজিক্যাল বা ডিজিটাল প্রোডাক্ট বুঝিয়ে দেননি, তবে নিম্নলিখিত পদক্ষেপ গ্রহণ করা হবে:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>ওয়ার্নিং ও সমাধান:</strong> রিপোর্ট পাওয়ার পর তা প্রমাণাদিসহ আপনাকে জানানো হবে। আপনি যদি কাস্টমারের সমস্যার সমাধান করতে ব্যর্থ হন বা অস্বীকৃতি জানান, তবে আপনার অ্যাকাউন্ট ব্যান করা হবে।</li>
          <li><strong>স্থায়ী নিষেধাজ্ঞা (Permanent Ban):</strong> অভিযোগ প্রমাণিত হলে ক্লায়েন্টের অ্যাকাউন্ট তাৎক্ষণিকভাবে পার্মানেন্ট ব্যান করা হবে এবং ওই ব্যক্তির NID/জন্ম নিবন্ধন আমাদের সার্ভারে কালোতালিকাভুক্ত (Blacklisted) হবে।</li>
          <li><strong>রিফান্ড বাধ্যবাধকতা:</strong> ক্লায়েন্টকে অবশ্যই কাস্টমারের সম্পূর্ণ টাকা নিজ দায়িত্বে ফেরত দিতে হবে।</li>
          <li><strong>মামলা ও আইনি পদক্ষেপ:</strong> কাস্টমারের থেকে টাকা নিয়ে তা যদি ক্লায়েন্ট ফেরত না দেন বা সমাধান না করেন, তবে ক্লায়েন্টের দেওয়া আইডেন্টিটি (NID/Birth Certificate) ব্যবহার করে দেশের প্রচলিত <strong>ভোক্তা অধিকার সংরক্ষণ আইন</strong> এবং <strong>ডিজিটাল নিরাপত্তা/সাইবার আইন</strong> অনুযায়ী আমরা সরাসরি আইনি ব্যবস্থা ও মামলা দায়ের করব।</li>
        </ul>
      </section>
    </div>
  </LegalLayout>
);`;

if (oldAntiFraudMatch) {
  code = code.replace(oldAntiFraudMatch[0], newAntiFraud);
  fs.writeFileSync('src/components/Legal.tsx', code);
  console.log('Legal Anti-Fraud fixed!');
} else {
  console.log('Could not find CustomerRightsAndAntiFraud');
}
