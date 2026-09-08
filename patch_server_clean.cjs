const fs = require('fs');
let file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  app.post('/api/verify-live', async (req, res) => {
    try {
      if (!supabaseAdmin) {
         return res.status(500).json({ error: "Service role key missing" });
      }
      
      const { invoiceId, senderNumber, provider, userId } = req.body;
      if (!invoiceId || !senderNumber || !userId) {
         return res.status(400).json({ error: "Missing required fields" });
      }

      // Clean the customer number
      const customerNum = (senderNumber || '').replace('+88', '');
      
      // Look for pending SMS
      const { data: smsEvents, error: smsError } = await supabaseAdmin
        .from('sms_events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (smsError) throw smsError;

      if (smsEvents && smsEvents.length > 0) {
          const expectedProvider = (provider || '').toLowerCase();
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
                      // Match found!
                      await supabaseAdmin.from('invoices').update({ status: 'Completed' }).eq('id', invoiceId);
                      await supabaseAdmin.from('sms_events').update({ status: 'matched', invoice_id: invoiceId }).eq('id', sms.id);
                      
                      return res.json({ matched: true });
                  }
              }
          }
      }
      
      res.json({ matched: false });
    } catch (error) {
      console.error('Error verifying live payment:', error);
      res.status(500).json({ error: error.message });
    }
  });`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, '');
  fs.writeFileSync(file, content);
  console.log("Server patched successfully");
} else {
  console.log("Failed to patch server");
}
