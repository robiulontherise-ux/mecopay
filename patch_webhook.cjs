const fs = require('fs');

let content = fs.readFileSync('./edge_function_sms_webhook.ts', 'utf-8');

// The original query just matches trxId
const originalQuery = `
      // Find pending invoice with this TrxID
      const { data: invoice } = await supabaseClient
        .from('invoices')
        .select('*')
        .eq('user_id', brand.user_id)
        .eq('trx_id', trxId)
        .eq('status', 'Pending')
        .single();
`;

// New logic: check provider as well
const strictQuery = `
      // Find pending invoices with this TrxID
      const { data: invoices } = await supabaseClient
        .from('invoices')
        .select('*')
        .eq('user_id', brand.user_id)
        .ilike('trx_id', trxId)
        .eq('status', 'Pending');
            
      let invoice = null;
      if (invoices && invoices.length > 0) {
          // Strict Provider Matching Logic
          const smsSender = (sender || '').toLowerCase();
          const smsTextMatch = (smsText || '').toLowerCase();
          
          for (const inv of invoices) {
              let expectedProvider = (inv.gateway_used || '').toLowerCase();
              let providerMatched = false;
              
              if (smsSender.includes(expectedProvider)) {
                  providerMatched = true;
              } else if (expectedProvider === 'rocket' && smsSender.includes('16216')) {
                  providerMatched = true;
              } else if (smsSender.match(/^(\\+880|01)\\d{9}$/)) {
                  // Test mode escape hatch
                  if (smsTextMatch.includes(expectedProvider)) {
                      providerMatched = true;
                  }
              }
              
              if (providerMatched) {
                  invoice = inv;
                  break;
              }
          }
      }
`;

content = content.replace(originalQuery, strictQuery);
fs.writeFileSync('./edge_function_sms_webhook.ts', content);

console.log("Patched webhook edge function!");
