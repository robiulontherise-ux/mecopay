const fs = require('fs');
let file = 'src/components/payment-hub/PaymentLinks.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `setLinks(links.filter(l => l.id !== id));\n      } catch`,
  `setLinks(links.filter(l => l.id !== id));\n        showToast("Deleted successfully!", "success");\n      } catch`
);

fs.writeFileSync(file, content);
