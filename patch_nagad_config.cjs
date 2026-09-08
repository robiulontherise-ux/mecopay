const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

// Fix Nagad color in getGatewayConfig
content = content.replace(/bg-\[#B21C1C\]/g, 'bg-[#ED1C24]');
content = content.replace(/text-\[#B21C1C\]/g, 'text-[#ED1C24]');

// Remove the explicit background from Upay Footer to stop the 'yellow bleed' effect.
// The user says "nicer dike side extra yellow color cole ashce solve koro"
// The problem is that the bodyBg is bg-[#FFCC00], and the footer is inside it. If we give the footer bg-slate-100, the corners might have yellow behind it.
// Wait, if the main card is `overflow-hidden` it shouldn't bleed out of the card. But if it's the bottom of the card, maybe there is another padding?
// Let's remove the `mt-auto` from footer or maybe make the whole card NOT have a hardcoded `min-h`? I already removed `min-h-[650px]`.
// Let's just remove the `bg-slate-100` from Upay footer and let it be yellow, OR if they want it white, keep it.
// Let's check where the extra yellow color is. If the card has `min-h-[650px]`, the flex-1 body would stretch and fill the space with yellow. Since I removed `min-h-[650px]`, it shouldn't have extra yellow at the bottom.
// Wait! `min-h-[650px]` was removed in the previous prompt but wait, I see `flex-1 ${gConfig.bodyBg}`.
// Let's make sure `min-h-[650px]` is actually gone.

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched nagad config");
