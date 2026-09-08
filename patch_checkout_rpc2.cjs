const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const newStr = `      // Retroactive check for Live Verify: Call secure backend RPC
      // This bypasses RLS safely to check if the SMS already arrived
      const { data: matched, error: rpcError } = await supabase.rpc('verify_live_payment', {
          p_invoice_id: invoiceId,
          p_sender_number: senderNumber,
          p_provider: selectedGateway.provider,
          p_user_id: linkData.user_id
      });

      if (matched === true) {
          // Match found by RPC, redirect to success
          window.location.href = '/access/' + invoiceId;
      } else {
          if (rpcError) console.error("RPC Error:", rpcError);
          // Wait for realtime updates on invoices table (Webhook will update it when SMS arrives)
          setStep(5);
          setTimeLeft(600);
      }`;

lines.splice(510, 50, newStr);

// Find the line `.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sms_events'`
let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes(".on('postgres_changes'") && lines[i+3] && lines[i+3].includes("table: 'sms_events'")) {
       startIdx = i;
   }
   if (startIdx !== -1 && lines[i].includes("      })") && i > startIdx + 10) {
       endIdx = i;
       break;
   }
}

if (startIdx !== -1 && endIdx !== -1) {
    lines.splice(startIdx, endIdx - startIdx + 1, `      // Listening ONLY to invoices table. Webhook or manual checks will update it.`);
    console.log("Patched realtime logic");
}

fs.writeFileSync(file, lines.join('\n'));
console.log("Patched file successfully.");
