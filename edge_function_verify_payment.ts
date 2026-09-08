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

    const payload = await req.json()
    const { invoice_id, trx_id } = payload;
    
    if (!invoice_id || !trx_id) {
      throw new Error('Missing invoice_id or trx_id');
    }

    // 1. Get the invoice to know which user_id it belongs to
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) throw new Error('Invoice not found')
    if (invoice.status === 'Completed') throw new Error('Invoice already completed')

    // 2. Look for an SMS event that matches this TrxID for this specific merchant (user_id)
    const { data: smsEvents, error: smsError } = await supabaseClient
      .from('sms_events')
      .select('*')
      .eq('user_id', invoice.user_id)
      .ilike('message', `%${trx_id}%`)
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
            } else if (smsSender.match(/^(\+880|01)\d{9}$/)) {
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
      
      // Update Invoice status
      await supabaseClient
        .from('invoices')
        .update({ status: 'Completed', trx_id: trx_id })
        .eq('id', invoice.id);

      // Mark SMS as matched
      await supabaseClient
        .from('sms_events')
        .update({ status: 'matched', invoice_id: invoice.id })
        .eq('id', sms.id);

      // (Optional) Here you could also trigger the webhook-sender edge function to notify the merchant

      return new Response(JSON.stringify({ success: true, message: 'Payment verified successfully.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      // TrxID not found in SMS records yet
      return new Response(JSON.stringify({ success: false, message: 'TrxID not found or amount mismatch. Please try again later.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
