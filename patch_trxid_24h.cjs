const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

const targetQuery = `.gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);`;

if(content.includes(targetQuery)) {
  content = content.replace(targetQuery, `.limit(1);`);
} else {
  console.log("Could not find the query");
}

const targetSmsCheck = `      if (smsData) {
        if (smsData.status === 'matched') {`;

const newSmsCheck = `      if (smsData) {
        // Check if SMS is older than 24 hours
        if (smsData.created_at) {
          const smsTime = new Date(smsData.created_at).getTime();
          const now = new Date().getTime();
          if ((now - smsTime) > 24 * 60 * 60 * 1000) {
            await supabase.from('invoices').update({ metadata: { note: "TrxID expired (24h limit). Please contact support." } }).eq('id', invoiceId);
            if (isDeviceOnline) {
              setVerifyError("TrxID expired (24h limit). Please contact support.");
              setIsVerifying(false);
              return;
            } else {
              setVerifyError("TrxID expired (24h limit). Please contact support.");
              setIsVerifying(false);
              return;
            }
          }
        }
        
        if (smsData.status === 'matched') {`;

if (content.includes(targetSmsCheck)) {
  content = content.replace(targetSmsCheck, newSmsCheck);
  console.log("Patched SMS check");
} else {
  console.log("Could not find targetSmsCheck");
}

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
