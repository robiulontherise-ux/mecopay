const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf8');
let lines = content.split('\n');
for (let i = 533; i < 542; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
