const fs = require('fs');
let code = fs.readFileSync('src/components/Legal.tsx', 'utf-8');

const oldRefundPolicyStart = 'export const RefundPolicy = () => (\n  <LegalLayout title="Refund Policy" icon={RefreshCcw} lastUpdated="৩ আগস্ট ২০২৬">\n    <div className="space-y-8">\n      <section>\n        <p>আমরা কাস্টমারদের অধিকার রক্ষায়';
const oldRefundPolicyEnd = '      </section>\n    </div>\n  </LegalLayout>\n);';

const newRefundPolicy = `export const RefundPolicy = () => (
  <LegalLayout title="Refund Policy" icon={RefreshCcw} lastUpdated="৩ আগস্ট ২০২৬">
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">রিফান্ড নীতি</h2>
        <p>রিফান্ড সংক্রান্ত যেকোনো সমস্যা সমাধানের জন্য অনুগ্রহ করে মার্চেন্টের সাথে সরাসরি যোগাযোগ করুন। MecoPay কোনো ধরনের রিফান্ড প্রক্রিয়ার জন্য দায়ী নয়, তবে কোনো ক্লায়েন্ট যদি সেবা প্রদান না করে টাকা আত্মসাৎ করে, তবে আমাদের অ্যান্টি-ফ্রড পলিসি অনুযায়ী প্রয়োজনীয় আইনি ব্যবস্থা নেওয়া হবে।</p>
      </section>
    </div>
  </LegalLayout>
);`;

// Let's just use string replace using the whole function
const refundMatch = code.match(/export const RefundPolicy = \(\) => \([\s\S]*?<\/LegalLayout>\n\);/);
if (refundMatch) {
  code = code.replace(refundMatch[0], newRefundPolicy);
  fs.writeFileSync('src/components/Legal.tsx', code);
  console.log('RefundPolicy updated');
} else {
  console.log('Could not find RefundPolicy');
}
