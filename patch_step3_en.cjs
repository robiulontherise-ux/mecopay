const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const oldLiveTextEn = "'Select this method, enter your sender number on the next page and confirm. A 10-min live session will start, send money within this time to auto-verify.'";
const newLiveTextEn = "'Confirm your sender number to start a 10-minute live session. Send money within this time for instant auto-verification.'";

content = content.replace(oldLiveTextEn, newLiveTextEn);
fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log('Fixed English Live Auto Verify Text');
