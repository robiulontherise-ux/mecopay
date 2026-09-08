const fs = require('fs');

function checkDivs(file) {
  const content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  let openCount = 0;
  for (let i=0; i<lines.length; i++) {
    let opens = (lines[i].match(/<div/g) || []).length;
    let closes = (lines[i].match(/<\/div>/g) || []).length;
    openCount += opens;
    openCount -= closes;
    if (openCount < 0) {
      console.log(`Too many closes at ${i+1}`);
      openCount = 0;
    }
  }
  console.log(`${file}: net opens = ${openCount}`);
}

checkDivs('src/components/payment-hub/GatewaySettings.tsx');
checkDivs('src/components/payment-hub/PaymentLinks.tsx');
