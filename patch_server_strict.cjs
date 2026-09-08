const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetSelect = `.select('amount, created_at')`;
const newSelect = `.select('amount, created_at, brand_id')`;
if (content.includes(targetSelect)) {
  content = content.replace(targetSelect, newSelect);
}

const targetAmountCheck = `                      // AMOUNT CHECK
                      if (!sms.amount_extracted || sms.amount_extracted < invoice.amount) {
                          continue; // Amount doesn't match, keep looking
                      }`;

const newAmountCheck = `                      // Fetch Brand overpayment setting
                      let allowOverpayment = false;
                      if (invoice.brand_id) {
                         const { data: brand } = await supabaseAdmin.from('brands').select('payment_amount_type').eq('id', invoice.brand_id).maybeSingle();
                         if (brand && brand.payment_amount_type === 'allow_overpayment') {
                             allowOverpayment = true;
                         }
                      }

                      // AMOUNT CHECK
                      if (!sms.amount_extracted || sms.amount_extracted < invoice.amount) {
                          continue; // Underpayment
                      }
                      
                      if (!allowOverpayment && sms.amount_extracted > invoice.amount) {
                          continue; // Overpayment not allowed, must be exact
                      }`;

if (content.includes(targetAmountCheck)) {
  content = content.replace(targetAmountCheck, newAmountCheck);
  fs.writeFileSync('server.ts', content);
  console.log("server.ts patched");
} else {
  console.log("Could not find targetAmountCheck in server.ts");
  console.log(content.substring(content.indexOf('// AMOUNT CHECK') - 100, content.indexOf('// AMOUNT CHECK') + 200));
}
