const fs = require('fs');

const content = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf8');
const lines = content.split('\n');

let stack = [];
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  let opens = (line.match(/<div/g) || []).length;
  for(let k=0; k<opens; k++) stack.push(i+1);
  
  let closes = (line.match(/<\/div>/g) || []).length;
  for(let k=0; k<closes; k++) {
    if (stack.length > 0) {
      stack.pop();
    } else {
      console.log(`Unmatched close on line ${i+1}`);
    }
  }
}

console.log('Unclosed divs from lines:', stack);
