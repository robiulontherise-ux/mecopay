const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

const targetSmsQuery = `      const { data: smsList } = await supabase
        .from('sms_events')
        .select('*')
        .eq('user_id', linkData.user_id)
        .ilike('trx_id_extracted', trxId)
        .limit(1);`;

const newSmsQuery = `      const { data: smsList } = await supabase
        .from('sms_events')
        .select('*')
        .eq('user_id', linkData.user_id)
        .ilike('trx_id_extracted', trxId)
        .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
        .limit(1);`;

if (content.includes(targetSmsQuery)) {
  content = content.replace(targetSmsQuery, newSmsQuery);
  fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
  console.log("Patched SMS lookup to limit to 48 hours.");
} else {
  console.log("Could not find targetSmsQuery");
}
