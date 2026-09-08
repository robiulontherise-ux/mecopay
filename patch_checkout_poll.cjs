const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `      // Polling timer for checking payment
      pollTimer = setInterval(async () => {
        if (!invoiceId || !senderNumber || !linkData) return;
        
        try {
          const res = await fetch('/api/verify-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invoiceId,
              senderNumber,
              provider: selectedGateway?.provider || '',
              userId: linkData.user_id
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.matched) {
               window.location.href = '/access/' + invoiceId;
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Check every 3 seconds`;

const newStr = `      // Polling timer for checking payment via RPC
      pollTimer = setInterval(async () => {
        if (!invoiceId || !senderNumber || !linkData || !selectedGateway) return;
        
        try {
          // Since the user ran the RPC verify_live_payment in SQL,
          // we can just call it repeatedly. It bypasses RLS and checks sms_events.
          const { data: matched, error: rpcError } = await supabase.rpc('verify_live_payment', {
              p_invoice_id: invoiceId,
              p_sender_number: senderNumber,
              p_provider: selectedGateway.provider,
              p_user_id: linkData.user_id
          });
          
          if (matched === true) {
             window.location.href = '/access/' + invoiceId;
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Check every 3 seconds`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(file, content);
  console.log("Patched successfully");
} else {
  console.log("Failed to patch");
}
