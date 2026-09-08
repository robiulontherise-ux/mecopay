const fs = require('fs');

function restoreDivs(file) {
  let data = fs.readFileSync(file, 'utf-8');
  data = data.replace(
    /<\/table>\n\s*<\/div>\n\s*<\/div>\n\s*\) : \(/g,
    '</table>\n</div>\n</div>\n</div>\n      ) : ('
  );
  fs.writeFileSync(file, data);
}

restoreDivs('src/components/payment-hub/GatewaySettings.tsx');
restoreDivs('src/components/payment-hub/PaymentLinks.tsx');
