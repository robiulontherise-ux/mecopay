const fs = require('fs');
let content = fs.readFileSync('./edge_function_sms_webhook.ts', 'utf-8');

const originalMatchLogic = `    // Try to extract TrxID and Amount (Very simplified example)
    const trxIdMatch = smsText.match(/TrxID\\s*[:\\s]\\s*([A-Z0-9]+)/i);
    const trxId = trxIdMatch ? trxIdMatch[1] : null;

    if (trxId) {
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

    if (invoice) {
        // Update invoice to Completed
        await supabaseClient
          .from('invoices')
          .update({ status: 'Completed' })
          .eq('id', invoice.id);
          
        // Mark SMS as matched
        await supabaseClient
          .from('sms_events')
          .update({ status: 'matched', invoice_id: invoice.id })
          .eq('id', smsEvent.id);
      }
    }`;

const newMatchLogic = `    // 1. Extract TrxID if present
    const trxIdMatch = smsText.match(/TrxID\\s*[:\\s]\\s*([A-Z0-9]+)/i);
    const trxId = trxIdMatch ? trxIdMatch[1] : null;

    // 2. We will look for an invoice that matches EITHER the TrxID (Manual Verify) OR the sender's phone number (Live Verify)
    let invoice = null;

    if (trxId) {
        const { data: trxInvoices } = await supabaseClient
          .from('invoices')
          .select('*')
          .eq('user_id', brand.user_id)
          .ilike('trx_id', trxId)
          .eq('status', 'Pending');
          
        if (trxInvoices && trxInvoices.length > 0) {
            const smsSender = (sender || '').toLowerCase();
            const smsTextMatch = (smsText || '').toLowerCase();
            
            for (const inv of trxInvoices) {
                let expectedProvider = (inv.gateway_used || '').toLowerCase();
                let providerMatched = false;
                
                if (smsSender.includes(expectedProvider)) {
                    providerMatched = true;
                } else if (expectedProvider === 'rocket' && smsSender.includes('16216')) {
                    providerMatched = true;
                } else if (smsSender.match(/^(\\+880|01)\\d{9}$/)) {
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
    }

    // 3. If no invoice found via TrxID, try LIVE VERIFY (matching by sender_number embedded in SMS text)
    if (!invoice) {
        const { data: liveInvoices } = await supabaseClient
          .from('invoices')
          .select('*')
          .eq('user_id', brand.user_id)
          .eq('status', 'Pending')
          .not('sender_number', 'is', null);
          
        if (liveInvoices && liveInvoices.length > 0) {
            const smsSender = (sender || '').toLowerCase();
            const smsTextMatch = (smsText || '').toLowerCase();
            
            for (const inv of liveInvoices) {
                // Remove +880 for matching flexibly
                const customerNum = (inv.sender_number || '').replace('+88', '');
                
                if (customerNum.length >= 10 && smsTextMatch.includes(customerNum)) {
                    // Number found in SMS! Now check provider.
                    let expectedProvider = (inv.gateway_used || '').toLowerCase();
                    let providerMatched = false;
                    
                    if (smsSender.includes(expectedProvider)) {
                        providerMatched = true;
                    } else if (expectedProvider === 'rocket' && smsSender.includes('16216')) {
                        providerMatched = true;
                    } else if (smsSender.match(/^(\\+880|01)\\d{9}$/)) {
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
        }
    }

    if (invoice) {
        // Update invoice to Completed
        await supabaseClient
          .from('invoices')
          .update({ status: 'Completed', trx_id: trxId || invoice.trx_id })
          .eq('id', invoice.id);
          
        // Mark SMS as matched
        await supabaseClient
          .from('sms_events')
          .update({ status: 'matched', invoice_id: invoice.id })
          .eq('id', smsEvent.id);
    }`;

content = content.replace(originalMatchLogic, newMatchLogic);
fs.writeFileSync('./edge_function_sms_webhook.ts', content);
console.log("Patched live verify in webhook");
