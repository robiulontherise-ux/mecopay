const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const oldBlockRegex = /\/\/ Separate effect for Polling Timer[\s\S]*?\}, \[step, verifyMethod, invoiceId, senderNumber, linkData, selectedGateway\]\);/m;

const newBlock = `// Separate effect for Live SMS Event Subscription (No Polling)
  useEffect(() => {
    if (step !== 5 || verifyMethod !== 'live' || !invoiceId || !senderNumber || !linkData || !selectedGateway) return;

    let isVerifyingRequest = false;

    const channel = supabase
      .channel(\`sms_events_\${invoiceId}\`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sms_events',
        filter: \`user_id=eq.\${linkData.user_id}\`
      }, async (payload) => {
        // When a new SMS is inserted for this merchant, check if it matches the customer's number
        const cleanNumber = senderNumber.replace('+88', '');
        const message = (payload.new.message || '').toLowerCase();
        
        if (cleanNumber.length >= 10 && message.includes(cleanNumber) && !isVerifyingRequest) {
           isVerifyingRequest = true;
           try {
             const res = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  invoiceId,
                  senderNumber,
                  verifyMethod: 'live',
                  provider: selectedGateway.provider,
                  userId: linkData.user_id
                })
             });
             if (res.ok) {
                const data = await res.json();
                if (data.success && data.redirect_link) {
                   window.location.href = data.redirect_link;
                }
             }
           } catch (err) {
             console.error("Verification error:", err);
           } finally {
             isVerifyingRequest = false;
           }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [step, verifyMethod, invoiceId, senderNumber, linkData, selectedGateway]);`;

content = content.replace(oldBlockRegex, newBlock);
fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
