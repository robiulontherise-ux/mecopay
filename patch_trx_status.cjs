const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

const targetQuery = `      const { data: smsData } = await supabase
        .from('sms_events')
        .select('*')
        .eq('user_id', linkData.user_id)
        .ilike('trx_id_extracted', trxId)
        .eq('status', 'pending')
        .maybeSingle();`;

const newQuery = `      const { data: smsList } = await supabase
        .from('sms_events')
        .select('*')
        .eq('user_id', linkData.user_id)
        .ilike('trx_id_extracted', trxId)
        .limit(1);
      
      const smsData = smsList && smsList.length > 0 ? smsList[0] : null;`;

if (content.includes(targetQuery)) {
  content = content.replace(targetQuery, newQuery);
} else {
  console.log("Could not find targetQuery");
}

const targetSmsCheck = `      if (smsData) {
        // CHECK AMOUNT`;

const newSmsCheck = `      if (smsData) {
        if (smsData.status === 'matched') {
          if (isDeviceOnline) {
             setVerifyError("This Transaction ID has already been used!");
             setIsVerifying(false);
             return;
          } else {
             // If device offline, we could theoretically let them submit, but since we already KNOW it's used, 
             // it's better to reject it anyway. But to maintain the offline behavior, we'll reject it regardless of online/offline status because we have proof it's used.
             setVerifyError("This Transaction ID has already been used!");
             setIsVerifying(false);
             return;
          }
        }
        
        // CHECK AMOUNT`;

if (content.includes(targetSmsCheck)) {
  content = content.replace(targetSmsCheck, newSmsCheck);
  fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
  console.log("Patched SMS check logic.");
} else {
  console.log("Could not find targetSmsCheck");
}
