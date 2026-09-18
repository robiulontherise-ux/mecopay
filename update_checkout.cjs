const fs = require('fs');

let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

// Replace handleManualVerify
const handleManualVerifyPattern = /const handleManualVerify = async \(e: React\.FormEvent\) => \{[\s\S]*?catch \(err: any\) \{[\s\S]*?setIsVerifying\(false\);\n    \}\n  \};/m;

const newHandleManualVerify = `const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    try {
      setIsVerifying(true);
      
      // 1. Check if invoice is older than 24 hours
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('created_at')
        .eq('id', invoiceId)
        .single();
        
      if (invoiceData && invoiceData.created_at) {
        const invoiceTime = new Date(invoiceData.created_at).getTime();
        const now = new Date().getTime();
        const diffHours = (now - invoiceTime) / (1000 * 60 * 60);
        if (diffHours > 24) {
          setVerifyError("Time expired! You can only verify within 24 hours of initiating the payment.");
          setIsVerifying(false);
          return;
        }
      }

      // Securely verify via Edge Function (server.ts)
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          trxId,
          verifyMethod: 'trx_id',
          userId: linkData.user_id,
          provider: selectedGateway.provider
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success && data.redirect_link) {
         window.location.href = data.redirect_link;
      } else {
         setVerifyError(data.message || "Invalid TrxID or amount mismatch. Please try again.");
      }

    } catch (err: any) {
      setVerifyError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };`;
  
// I need a robust regex to replace it
const parts = content.split("const handleManualVerify = async (e: React.FormEvent) => {");
if (parts.length > 1) {
    const endPart = parts[1].split("  const handleLiveSubmit = async (e: React.FormEvent) => {");
    if (endPart.length > 1) {
        content = parts[0] + newHandleManualVerify + "\n\n  const handleLiveSubmit = async (e: React.FormEvent) => {" + endPart[1];
    }
}

// Replace setInterval polling
const pollingPattern = /pollTimer = setInterval\(async \(\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?console\.error\("Polling error:", err\);\n        \}\n      \}, 3000\);/m;

const newPolling = `pollTimer = setInterval(async () => {
        if (!invoiceId || !senderNumber || !linkData || !selectedGateway) return;
        
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
          console.error("Polling error:", err);
        }
      }, 5000);`;
      
content = content.replace(pollingPattern, newPolling);

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content, 'utf-8');
console.log('CheckoutPage.tsx updated successfully');
