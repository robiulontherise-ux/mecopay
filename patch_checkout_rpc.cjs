const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace handleLiveSubmit logic
const targetStr1 = `      // Retroactive check for Live Verify: Did the SMS already arrive?
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
          // If already arrived, complete immediately!
          await supabase.from('invoices').update({ status: 'Completed' }).eq('id', invoiceId);
          await supabase.from('sms_events').update({ status: 'matched', invoice_id: invoiceId }).eq('id', smsData.id);
          window.location.href = '/access/' + invoiceId;
      } else {
          // Wait for realtime
          setStep(5);
          setTimeLeft(600);
      }`;

const newStr1 = `      // Retroactive check for Live Verify: Call secure backend RPC
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

if (content.includes(targetStr1)) {
    content = content.replace(targetStr1, newStr1);
    console.log("Patched Retroactive Check!");
} else {
    console.log("Failed to patch Retroactive Check. Target string not found.");
}

// Remove Realtime listener for sms_events
const targetStr2 = `      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sms_events',
        filter: \`user_id=eq.\${linkData?.user_id}\`
      }, async (payload) => {
        // Auto verification logic for Live verify if SMS arrives AFTER confirm
        if (step === 5 && verifyMethod === 'live' && senderNumber && selectedGateway) {
          const sms = payload.new;
          if (sms.status === 'pending') {
            const customerNum = (senderNumber || '').replace('+88', '');
            const smsSender = (sms.sender || '').toLowerCase();
            const msgText = (sms.message || '').toLowerCase();
            const expectedProvider = (selectedGateway.provider || '').toLowerCase();
            
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
                  await supabase.from('invoices').update({ status: 'Completed' }).eq('id', invoiceId);
                  await supabase.from('sms_events').update({ status: 'matched', invoice_id: invoiceId }).eq('id', sms.id);
                  window.location.href = '/access/' + invoiceId;
              }
            }
          }
        }
      })`;

const newStr2 = `      // We only listen to invoices table. 
      // The webhook or our manual checks will update the invoice to 'Completed'.`;

if (content.includes(targetStr2)) {
    content = content.replace(targetStr2, newStr2);
    console.log("Patched Realtime Listener!");
} else {
    console.log("Failed to patch Realtime Listener. Target string not found.");
}

fs.writeFileSync(file, content);
