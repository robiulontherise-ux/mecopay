const fs = require('fs');

let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

// Add realtime listener
const listenerCode = `
  useEffect(() => {
    if (!invoiceId) return;

    const channel = supabase
      .channel('invoice-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'invoices',
        filter: \`id=eq.\${invoiceId}\`
      }, (payload) => {
        if (payload.new.status === 'Completed') {
          // Success! Redirect.
          const rLink = linkData?.redirect_link;
          if (rLink) {
            let finalLink = rLink.trim();
            if (!finalLink.startsWith('http')) {
              finalLink = 'https://' + finalLink;
            }
            window.location.href = finalLink;
          } else {
             window.location.href = '/success'; // Fallback
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invoiceId, linkData]);
`;

if (!content.includes("channel('invoice-updates')")) {
    content = content.replace('useEffect(() => {', listenerCode + '\n  useEffect(() => {');
}

// Update handleManualVerify to retroactively check for an existing sms_event
// If it finds one, it immediately completes it.
const manualVerifyOriginal = `  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsVerifying(true);
      const { error } = await supabase
        .from('invoices')
        .update({
          gateway_number: selectedGateway.number,
          trx_id: trxId,
          status: 'Pending'
        })
        .eq('id', invoiceId);
      if (error) throw error;
      setStep(6);
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit verification: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };`;

const manualVerifyNew = `  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsVerifying(true);
      
      // Update invoice first
      const { error } = await supabase
        .from('invoices')
        .update({
          gateway_number: selectedGateway.number,
          trx_id: trxId,
          status: 'Pending'
        })
        .eq('id', invoiceId);
      if (error) throw error;

      // Retroactive check: Did the SMS already arrive?
      const { data: smsData } = await supabase
        .from('sms_events')
        .select('*')
        .eq('user_id', linkData.user_id)
        .ilike('trx_id_extracted', trxId)
        .eq('status', 'pending')
        .maybeSingle();

      if (smsData) {
        // Match found instantly!
        await supabase.from('invoices').update({ status: 'Completed' }).eq('id', invoiceId);
        await supabase.from('sms_events').update({ status: 'matched', invoice_id: invoiceId }).eq('id', smsData.id);
        
        // Redirect immediately
        const rLink = linkData?.redirect_link;
        if (rLink) {
          let finalLink = rLink.trim();
          if (!finalLink.startsWith('http')) {
            finalLink = 'https://' + finalLink;
          }
          window.location.href = finalLink;
          return;
        }
      }

      setStep(6);
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit verification: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };`;

content = content.replace(manualVerifyOriginal, manualVerifyNew);

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Updated CheckoutPage.tsx");
