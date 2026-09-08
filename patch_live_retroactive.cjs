const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

const originalLiveSubmit = `  const handleLiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsVerifying(true);
      const { error } = await supabase
        .from('invoices')
        .update({
          gateway_number: selectedGateway.number,
          gateway_used: selectedGateway.provider,
          sender_number: senderNumber,
          status: 'Pending'
        })
        .eq('id', invoiceId);
      if (error) throw error;
      setStep(5); // Proceed to countdown
    } catch (err: any) {
      console.error(err);
      alert("Failed: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };`;

const newLiveSubmit = `  const handleLiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsVerifying(true);
      const { error } = await supabase
        .from('invoices')
        .update({
          gateway_number: selectedGateway.number,
          gateway_used: selectedGateway.provider,
          sender_number: senderNumber,
          status: 'Pending'
        })
        .eq('id', invoiceId);
      if (error) throw error;

      // Retroactive check for Live Verify: Did the SMS already arrive?
      // Look for pending SMS containing the senderNumber in the message
      const customerNum = (senderNumber || '').replace('+88', '');
      const { data: smsEvents } = await supabase
        .from('sms_events')
        .select('*')
        .eq('user_id', linkData.user_id)
        .eq('status', 'pending');

      let smsData = null;
      if (smsEvents && smsEvents.length > 0) {
          const expectedProvider = (selectedGateway.provider || '').toLowerCase();
          for (const sms of smsEvents) {
              const smsSender = (sms.sender || '').toLowerCase();
              const msgText = (sms.message || '').toLowerCase();
              
              if (customerNum.length >= 10 && msgText.includes(customerNum)) {
                  let providerMatched = false;
                  if (smsSender.includes(expectedProvider)) {
                      providerMatched = true;
                  } else if (expectedProvider === 'rocket' && smsSender.includes('16216')) {
                      providerMatched = true;
                  } else if (smsSender.match(/^(\\+880|01)\\d{9}$/)) {
                      if (msgText.includes(expectedProvider)) {
                          providerMatched = true;
                      }
                  }
                  
                  if (providerMatched) {
                      smsData = sms;
                      break;
                  }
              }
          }
      }

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

      setStep(5); // Proceed to countdown
    } catch (err: any) {
      console.error(err);
      alert("Failed: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };`;

content = content.replace(originalLiveSubmit, newLiveSubmit);
fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched Live Verify retroactive check!");
