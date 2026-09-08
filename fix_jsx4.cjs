const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace the missing </div>
  if (content.includes('</table></div></div>\n      ) : (')) {
    content = content.replace('</table></div></div>\n      ) : (', '</table></div></div></div>\n      ) : (');
  }
  fs.writeFileSync(filePath, content);
}

fixFile('src/components/payment-hub/GatewaySettings.tsx');
fixFile('src/components/payment-hub/PaymentLinks.tsx');
