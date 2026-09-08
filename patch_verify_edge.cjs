const fs = require('fs');

let content = fs.readFileSync('./edge_function_verify_payment.ts', 'utf-8');

// The original query just matches trxId
const originalQuery = `
    // 2. Look for an SMS event that matches this TrxID for this specific merchant (user_id)
    const { data: smsEvents, error: smsError } = await supabaseClient
      .from('sms_events')
      .select('*')
      .eq('user_id', invoice.user_id)
      .ilike('message', \`%\${trx_id}%\`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    if (smsError) throw smsError;

    if (smsEvents && smsEvents.length > 0) {
      const sms = smsEvents[0];
`;

const strictQuery = `
    // 2. Look for an SMS event that matches this TrxID for this specific merchant (user_id)
    const { data: smsEvents, error: smsError } = await supabaseClient
      .from('sms_events')
      .select('*')
      .eq('user_id', invoice.user_id)
      .ilike('message', \`%\${trx_id}%\`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (smsError) throw smsError;
    
    let matchedSms = null;

    if (smsEvents && smsEvents.length > 0) {
        // Strict Provider Matching Logic
        const expectedProvider = (invoice.gateway_used || '').toLowerCase();
        
        for (const sms of smsEvents) {
            let providerMatched = false;
            const smsSender = (sms.sender || '').toLowerCase();
            const msgText = (sms.message || '').toLowerCase();
            
            if (smsSender.includes(expectedProvider)) {
                providerMatched = true;
            } else if (expectedProvider === 'rocket' && smsSender.includes('16216')) {
                providerMatched = true;
            } else if (smsSender.match(/^(\\+880|01)\\d{9}$/)) {
                // Test mode escape hatch
                if (msgText.includes(expectedProvider)) {
                    providerMatched = true;
                }
            }
            
            if (providerMatched) {
                matchedSms = sms;
                break;
            }
        }
    }

    if (matchedSms) {
      const sms = matchedSms;
`;

content = content.replace(originalQuery, strictQuery);
fs.writeFileSync('./edge_function_verify_payment.ts', content);

console.log("Patched verify edge function!");
