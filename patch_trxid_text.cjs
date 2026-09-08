const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const oldTrxIdTextEN = 'Wait 10-15 seconds after payment, then enter TrxID below to verify. You can close this page and return to this payment page anytime within 24 hours to auto-verify using your TrxID.';
const newTrxIdTextEN = 'Wait 10-15 seconds after payment, then enter TrxID below to verify. You can close this page and return to this payment page anytime within 2 hours to auto-verify using your TrxID.';

const oldTrxIdTextBN = 'পেমেন্ট করার পর ১০-১৫ সেকেন্ড অপেক্ষা করে নিচের বক্সে TrxID দিন। আপনি চাইলে পেজ কেটে দিয়ে ২৪ ঘণ্টার মধ্যে যেকোনো সময় এই পেমেন্ট পেজে নতুনভাবে এসে TrxID দিয়ে অটো ভেরিফাই করতে পারবেন।';
const newTrxIdTextBN = 'পেমেন্ট করার পর ১০-১৫ সেকেন্ড অপেক্ষা করে নিচের বক্সে TrxID দিন। আপনি চাইলে পেজ কেটে দিয়ে ২ ঘণ্টার মধ্যে যেকোনো সময় এই পেমেন্ট পেজে নতুনভাবে এসে TrxID দিয়ে অটো ভেরিফাই করতে পারবেন।';

content = content.replace(oldTrxIdTextEN, newTrxIdTextEN);
content = content.replace(oldTrxIdTextBN, newTrxIdTextBN);

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log('Patched TrxID text');
