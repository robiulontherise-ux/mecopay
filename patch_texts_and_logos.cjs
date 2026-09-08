const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

// 1. Revert Step 3 Live Text EN
content = content.replace(
  /'Confirm your sender number to start a 10-minute live session\. Send money within this time for instant auto-verification\.'/g,
  "'Select this method, enter your sender number on the next page and confirm. A 10-min live session will start, send money within this time to auto-verify.'"
);

// Revert Step 3 Live Text BN
content = content.replace(
  /'এই মেথডে আপনার সেন্ডার নম্বর দিলে ১০ মিনিটের একটি লাইভ সেশন চালু হবে। নির্ধারিত সময়ের মধ্যে সেন্ড মানি করলেই পেমেন্ট স্বয়ংক্রিয়ভাবে ভেরিফাই হয়ে যাবে।'/g,
  "'লাইভ মেথড সিলেক্ট করলে, পরের পেইজে আপনি যে একাউন্ট নম্বর থেকে টাকা পাঠাবেন সেটি দিয়ে নিশ্চিত করলে ১০ মিনিটের লাইভ সেশন চালু হবে। এর মধ্যে সেন্ড মানি করলেই পেমেন্ট অটো ভেরিফাই হবে।'"
);

// Revert Step 3 TrxID Text EN
content = content.replace(
  /'Use this for Cash In from a shop or Send Money from others\. Wait 10-15 seconds after payment, then verify with TrxID\. You can close this page and auto-verify anytime within 24 hours\.'/g,
  "'Cash In from a shop or ask someone else to Send Money. Then verify using the Transaction ID (TrxID).'"
);

// Revert Step 3 TrxID Text BN
content = content.replace(
  /'দোকান থেকে ক্যাশ-ইন বা অন্য কারো থেকে সেন্ড মানি করতে এটি ব্যবহার করুন। পেমেন্ট করার পর ১০-১৫ সেকেন্ড অপেক্ষা করে TrxID দিয়ে সাবমিট করুন। পেজ কেটে দিয়ে ২৪ ঘণ্টার মধ্যে যেকোনো সময় আবার এসে অটো ভেরিফাই করতে পারবেন।'/g,
  "'দোকান থেকে ক্যাশ-ইন করুন বা দূরের কাউকে দিয়ে সেন্ড মানি করান। এরপর ট্রানজেকশন আইডি (TrxID) দিয়ে ভেরিফাই করুন।'"
);

// 2. Fix Nagad Cash In text in Step 4
content = content.replace(
  /Nagad does not accept Cash In\. Please use Send Money from another account\./g,
  "Cash In is not allowed in Nagad, so please Send Money from another account."
);
content = content.replace(
  /নগদ এ ক্যাশ-ইন করা যায় না, তাই অন্য কারো নগদ থেকে সেন্ড মানি করুন।/g,
  "নগদ-এ ক্যাশ-ইন অ্যালাউড নয়, তাই অন্য কারো নগদ থেকে সেন্ড মানি করুন।"
);

// 3. Fix Point 3 in Step 4 (Remove 'link', specify new arrival, 24 hr)
content = content.replace(
  /Wait 10-15 seconds after payment, then enter TrxID below to verify\. You can close this page and return anytime within 24 hours to auto-verify using your TrxID\./g,
  "Wait 10-15 seconds after payment, then enter TrxID below to verify. You can close this page and return to this payment page anytime within 24 hours to auto-verify using your TrxID."
);
content = content.replace(
  /পেমেন্ট করার পর ১০-১৫ সেকেন্ড অপেক্ষা করে নিচের বক্সে TrxID দিন। আপনি চাইলে পেজ কেটে দিয়ে ২৪ ঘণ্টার মধ্যে যেকোনো সময় লিংকে এসে TrxID দিয়ে অটো ভেরিফাই করতে পারবেন।/g,
  "পেমেন্ট করার পর ১০-১৫ সেকেন্ড অপেক্ষা করে নিচের বক্সে TrxID দিন। আপনি চাইলে পেজ কেটে দিয়ে ২৪ ঘণ্টার মধ্যে যেকোনো সময় এই পেমেন্ট পেজে নতুনভাবে এসে TrxID দিয়ে অটো ভেরিফাই করতে পারবেন।"
);

// 4. Update Nagad Bottom Logo (Make it pure white)
content = content.replace(
  /className="h-8 grayscale brightness-200"/g,
  'className="h-8 brightness-0 invert opacity-90"'
);

// 5. Update Top Icon in Step 4 (Remove gateway logo, use brand logo or cart)
const oldStep4HeaderLogo = '<img src={logoUrl} alt={selectedGateway.provider} className="h-12 object-contain mb-4" />';
const newStep4HeaderLogo = `
                 {brandData?.logo_url ? (
                   <img src={brandData.logo_url} alt={brandData.name} className="h-12 w-12 object-cover rounded-full shadow-sm mb-4" />
                 ) : (
                   <ShoppingCart className="w-12 h-12 mb-4 opacity-80" />
                 )}`;
content = content.replace(oldStep4HeaderLogo, newStep4HeaderLogo);

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log('Patch successful');
