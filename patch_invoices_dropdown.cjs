const fs = require('fs');
let file = 'src/components/payment-hub/Invoices.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<option value="Cancelled">Cut Invoices</option>',
  '<option value="Cancelled">Cancelled</option>\n          <option value="Cut Invoice">Cut Invoices</option>'
);

// We need to allow `inv.status === 'Cut Invoice'` to pass if we select 'Cut Invoices'
// Wait, the filter is: inv.status?.toUpperCase() !== statusFilter.toUpperCase()
// So if statusFilter is 'Cut Invoice', it will match inv.status = 'Cut Invoice' perfectly.

// Let's also update the styling for Cut Invoice in the table:
content = content.replace(
  "inv.status?.toLowerCase() === 'pending' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : ",
  "inv.status?.toLowerCase() === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : \n                        inv.status?.toLowerCase() === 'cut invoice' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : "
);

// Wait, before the replacement above, let's see exactly what's there
fs.writeFileSync(file, content);
