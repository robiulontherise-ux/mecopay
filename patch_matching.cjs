const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

// 1. Add gateway_used to invoice updates
content = content.replace(
  `gateway_number: selectedGateway.number,`,
  `gateway_number: selectedGateway.number,\n          gateway_used: selectedGateway.provider,`
);
// replace again in case there are two (handleManualVerify and handleLiveSubmit)
content = content.replace(
  `gateway_number: selectedGateway.number,`,
  `gateway_number: selectedGateway.number,\n          gateway_used: selectedGateway.provider,`
);

// 2. Add strict matching in handleManualVerify
const originalCheck = `if (smsData) {
        // Match found instantly!`;

const strictCheck = `if (smsData) {
        // Strict Provider Matching!
        let providerMatched = false;
        const smsSender = (smsData.sender || '').toLowerCase();
        const expectedProvider = (selectedGateway.provider || '').toLowerCase();
        
        if (smsSender.includes(expectedProvider)) {
            providerMatched = true; // matches 'bkash', 'nagad', 'upay'
        } else if (expectedProvider === 'rocket' && smsSender.includes('16216')) {
            providerMatched = true; // Rocket uses 16216
        } else if (smsSender.match(/^(\\+880|01)\\d{9}$/)) {
            // TEST MODE: If the SMS came from a personal number (like +88015...), 
            // allow it ONLY if the message text contains the provider name!
            const msgText = (smsData.message || '').toLowerCase();
            if (msgText.includes(expectedProvider)) {
                providerMatched = true;
            } else if (msgText.includes('cash in') || msgText.includes('received')) {
                // Generous fallback for their exact current testing if they don't include 'bkash' in test sms
                // Actually, let's just allow it for testing if it's a personal number, to avoid breaking their demo.
                // Or better, let's strictly require the message to contain the provider name OR just allow it.
                // The user said: "jekono akat theke patahlei eta to ar proffesional na taina" (it's not professional if it verifies from anywhere)
                // So let's force them to include the provider name in the test SMS!
                if (msgText.includes(expectedProvider)) {
                    providerMatched = true;
                } else {
                    providerMatched = false;
                }
            }
        }

        if (providerMatched) {
          // Match found and verified instantly!`;

content = content.replace(originalCheck, strictCheck);

// Also need to close the if(providerMatched) block
const originalSuccess = `window.location.href = finalLink;
          return;
        }
      }`;

const strictSuccess = `window.location.href = finalLink;
            return;
          }
        }
      }`;

content = content.replace(originalSuccess, strictSuccess);

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched strict matching!");
