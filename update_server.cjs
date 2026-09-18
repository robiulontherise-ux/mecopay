const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

const verifyPaymentEndpoint = `
  app.post('/api/verify-payment', async (req, res) => {
    try {
      if (!supabaseAdmin) {
         return res.status(500).json({ error: "Service role key missing" });
      }
      
      const { invoiceId, verifyMethod, trxId, senderNumber, provider, userId } = req.body;
      if (!invoiceId || !userId || !verifyMethod) {
         return res.status(400).json({ error: "Missing required fields" });
      }

      // 1. Fetch the invoice to get amount, time, and redirect_link
      const { data: invoice, error: invError } = await supabaseAdmin
        .from('invoices')
        .select('amount, created_at, brand_id, redirect_link, status')
        .eq('id', invoiceId)
        .single();
        
      if (invError || !invoice) {
         return res.status(404).json({ error: "Invoice not found" });
      }

      if (invoice.status === 'Completed') {
         return res.json({ success: true, redirect_link: invoice.redirect_link });
      }

      // 2. Fetch Brand overpayment setting
      let allowOverpayment = false;
      if (invoice.brand_id) {
         const { data: brand } = await supabaseAdmin.from('brands').select('payment_amount_type').eq('id', invoice.brand_id).maybeSingle();
         // Check if the setting implies allowing overpayment (usually 'equal' vs something else, depending on exact string used by user)
         // The screenshot shows 'Equal Amount Only' but stored as 'equal' ? We will check if it's NOT 'equal' or explicitly allow.
         // Let's assume 'equal' means exact. Anything else allows overpayment.
         if (brand && brand.payment_amount_type !== 'equal' && brand.payment_amount_type !== 'Equal Amount Only') {
             allowOverpayment = true;
         }
      }

      const expectedProvider = (provider || '').toLowerCase();

      // --- TrxID Verification ---
      if (verifyMethod === 'trx_id') {
          if (!trxId) return res.status(400).json({ error: "TrxID required" });
          
          const { data: smsEvents, error: smsError } = await supabaseAdmin
            .from('sms_events')
            .select('*')
            .eq('user_id', userId)
            .ilike('trx_id_extracted', \`%\${trxId}%\`)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (smsError) throw smsError;

          if (smsEvents && smsEvents.length > 0) {
              const sms = smsEvents[0];
              
              // AMOUNT CHECK
              if (!sms.amount_extracted || sms.amount_extracted < invoice.amount) {
                  return res.json({ success: false, message: "Underpayment detected" });
              }
              if (!allowOverpayment && sms.amount_extracted > invoice.amount) {
                  return res.json({ success: false, message: "Overpayment not allowed, must be exact amount" });
              }
              
              // Match found!
              await supabaseAdmin.from('invoices').update({ status: 'Completed', trx_id: trxId }).eq('id', invoiceId);
              await supabaseAdmin.from('sms_events').update({ status: 'matched', invoice_id: invoiceId }).eq('id', sms.id);
              
              return res.json({ success: true, redirect_link: invoice.redirect_link });
          } else {
              return res.json({ success: false, message: "TrxID not found" });
          }
      }

      // --- 10 Min Live Session Verification ---
      if (verifyMethod === 'live') {
          if (!senderNumber) return res.status(400).json({ error: "Sender number required" });
          const customerNum = senderNumber.replace('+88', '');
          
          const cutoffTime = invoice.created_at;
          
          const { data: smsEvents, error: smsError } = await supabaseAdmin
            .from('sms_events')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .gte('created_at', cutoffTime);
            
          if (smsError) throw smsError;
          
          if (smsEvents && smsEvents.length > 0) {
              for (const sms of smsEvents) {
                  const smsSender = (sms.sender || '').toLowerCase();
                  const msgText = (sms.message || '').toLowerCase();
                  
                  if (customerNum.length >= 10 && msgText.includes(customerNum)) {
                      let providerMatched = false;
                      if (smsSender.includes(expectedProvider)) {
                          providerMatched = true;
                      } else if (expectedProvider === 'rocket' && smsSender.includes('16216')) {
                          providerMatched = true;
                      } else if (msgText.includes(expectedProvider)) {
                          providerMatched = true;
                      }
                      
                      if (providerMatched) {
                          // AMOUNT CHECK
                          if (!sms.amount_extracted || sms.amount_extracted < invoice.amount) {
                              continue; // Underpayment
                          }
                          if (!allowOverpayment && sms.amount_extracted > invoice.amount) {
                              continue; // Overpayment not allowed, must be exact
                          }
                          
                          // Match found!
                          await supabaseAdmin.from('invoices').update({ status: 'Completed', sender_number: senderNumber }).eq('id', invoiceId);
                          await supabaseAdmin.from('sms_events').update({ status: 'matched', invoice_id: invoiceId }).eq('id', sms.id);
                          
                          return res.json({ success: true, redirect_link: invoice.redirect_link });
                      }
                  }
              }
          }
          return res.json({ success: false, message: "Payment not received yet" });
      }

      return res.status(400).json({ error: "Invalid verifyMethod" });
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ error: error.message });
    }
  });
`;

// Replace or insert the new endpoint
if (content.includes("app.post('/api/verify-live'")) {
    // Find the end of app.post('/api/verify-live', ...)
    const startIndex = content.indexOf("app.post('/api/verify-live'");
    const endIndex = content.indexOf("  // Custom Domain & Subdomain Routing Middleware", startIndex);
    if(endIndex > -1) {
        content = content.slice(0, startIndex) + verifyPaymentEndpoint + "\n" + content.slice(endIndex);
        fs.writeFileSync('server.ts', content, 'utf-8');
        console.log('Successfully replaced verify-live with verify-payment');
    } else {
        console.error('Could not find end of verify-live');
    }
} else {
    console.error('Could not find verify-live');
}
