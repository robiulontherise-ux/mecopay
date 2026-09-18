const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const oldBlock = `      // 3. Pre-verify for Online Devices: Check if TrxID exists in sms_events
      const { data: smsMatch, error: smsErr } = await supabase
        .from('sms_events')
        .select('id')
        .eq('user_id', linkData.user_id)
        .ilike('trx_id_extracted', \\\`%\\\${trxId}%\\\`)
        .eq('status', 'pending')
        .limit(1);

      if (smsErr || !smsMatch || smsMatch.length === 0) {
        setVerifyError("TrxID not found or already used. Please wait a moment and try again.");
        setIsVerifying(false);
        return;
      }`;

const newBlock = `      // 3. Pre-verify for Online Devices: Check if TrxID exists in sms_events
      const { data: smsMatch, error: smsErr } = await supabase
        .from('sms_events')
        .select('id, status, created_at')
        .eq('user_id', linkData.user_id)
        .ilike('trx_id_extracted', \`%\${trxId}%\`)
        .limit(1);

      if (smsErr || !smsMatch || smsMatch.length === 0) {
        setVerifyError("TrxID not found.");
        setIsVerifying(false);
        return;
      }

      const sms = smsMatch[0];
      if (sms.status && sms.status.toLowerCase() !== 'pending') {
        setVerifyError("TrxID already used.");
        setIsVerifying(false);
        return;
      }

      if (sms.created_at) {
        const smsTime = new Date(sms.created_at).getTime();
        const nowSms = new Date().getTime();
        const diffHoursSms = (nowSms - smsTime) / (1000 * 60 * 60);
        if (diffHoursSms > 24) {
          setVerifyError("Time expired.");
          setIsVerifying(false);
          return;
        }
      }`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
