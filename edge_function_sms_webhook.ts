import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Typically webhook sends data in body
    const payload = await req.json()
    const url = new URL(req.url)
    const secret = url.searchParams.get('secret') || payload.secret || req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!secret) throw new Error('No secret provided');

    // Authenticate client
    const { data: brand, error: brandError } = await supabaseClient
      .from('brands')
      .select('user_id')
      .eq('webhook_secret', secret)
      .single()

    if (brandError || !brand) throw new Error('Invalid secret')

    const smsText = payload.message || payload.text || '';
    const sender = payload.sender || payload.from || '';

    // Insert SMS Event
    const { data: smsEvent, error: smsError } = await supabaseClient
      .from('sms_events')
      .insert({
        user_id: brand.user_id,
        sender: sender,
        message: smsText,
        raw_payload: payload,
        status: 'pending'
      })
      .select()
      .single()

    if (smsError) throw smsError;

    // Try to extract TrxID and Amount (Very simplified example)
    const trxIdMatch = smsText.match(/TrxID\s*[:\s]\s*([A-Z0-9]+)/i);
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
              } else if (smsSender.match(/^(\+880|01)\d{9}$/)) {
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
    }

    return new Response(JSON.stringify({ success: true, received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
