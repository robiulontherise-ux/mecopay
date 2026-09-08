const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "supabase.from('invoices').update({ status: 'Cancelled & Returned to Form (from Gateway)' }).eq('id', invoiceId).then();",
  "supabase.from('invoices').update({ status: 'Cancelled - Returned to Form' }).eq('id', invoiceId).then();"
);

content = content.replace(
  "supabase.from('invoices').update({ status: 'Cancelled' }).eq('id', invoiceId).then();",
  "supabase.from('invoices').update({ status: 'Cancelled - Returned to Gateway' }).eq('id', invoiceId).then();"
);

fs.writeFileSync(file, content);
