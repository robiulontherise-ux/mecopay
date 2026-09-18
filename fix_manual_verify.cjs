const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const regex = /\/\/ 2\. Pre-verify: Check if TrxID exists in sms_events before calling Edge function[\s\S]*?\} finally \{/m;

const newBlock = `// 2. If Device is Offline, bypass Edge function and save for Manual Verification
      if (verifyMethod === 'offline') {
        const { error: updateErr } = await supabase
          .from('invoices')
          .update({ trx_id: trxId, status: 'Manual Verification Pending' })
          .eq('id', invoiceId);
          
        if (updateErr) throw updateErr;
        setStep(6);
        setIsVerifying(false);
        return;
      }

      // 3. Pre-verify for Online Devices: Check if TrxID exists in sms_events
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
      
      if (res.ok && data.success) {
         window.location.href = data.redirect_url || data.delivery?.url || data.redirect_link || '/access/' + invoiceId;
      } else {
         setVerifyError(data.message || "Invalid TrxID or amount mismatch. Please try again.");
      }

    } catch (err: any) {
      setVerifyError(err.message || 'Verification failed');
    } finally {`;

content = content.replace(regex, newBlock);
fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
