const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldEffect = `  useEffect(() => {
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
          // Success! Redirect to the secure access page
          window.location.href = '/access/' + invoiceId;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invoiceId, linkData]);`;

const newEffect = `  useEffect(() => {
    if (!invoiceId) return;

    const channel = supabase
      .channel(\`realtime-updates-\${invoiceId}\`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'invoices',
        filter: \`id=eq.\${invoiceId}\`
      }, (payload) => {
        if (payload.new.status === 'Completed') {
          // Success! Redirect to the secure access page
          window.location.href = '/access/' + invoiceId;
        }
      })
      .on('postgres_changes', {
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
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invoiceId, linkData, step, verifyMethod, senderNumber, selectedGateway]);`;

content = content.replace(oldEffect, newEffect);
fs.writeFileSync(file, content);
