const fs = require('fs');
let pl = fs.readFileSync('src/components/payment-hub/PaymentLinks.tsx', 'utf-8');

pl = pl.replace(
  /if \(await showConfirm\("Are you sure you want to delete this payment link\? Your past transaction records will be kept safe\."\)\) \{/,
  `const res = await showConfirm({
      msg: "Are you sure you want to delete this payment link? Your past transaction records will be kept safe.",
      requireType: "delete"
    });
    if (res && res.confirmed) {`
);

fs.writeFileSync('src/components/payment-hub/PaymentLinks.tsx', pl);
