const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const oldBlock = `      // 4. Securely verify via Edge Function (server.ts)
      const res = await fetch('/api/verify-payment', {`;

const newBlock = `      // 3. Pre-verify for Online Devices: Check if TrxID exists in sms_events
      const { data: smsMatch, error: smsErr } = await supabase
        .from('sms_events')
        .select('id')
        .eq('user_id', linkData.user_id)
        .ilike('trx_id_extracted', \`%\${trxId}%\`)
        .eq('status', 'pending')
        .limit(1);

      if (smsErr || !smsMatch || smsMatch.length === 0) {
        setVerifyError("TrxID not found or already used. Please wait a moment and try again.");
        setIsVerifying(false);
        return;
      }

      // 4. Securely verify via Edge Function (server.ts)
      const res = await fetch('/api/verify-payment', {`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
