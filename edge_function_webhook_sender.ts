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

    // This function can be called internally by database triggers or other edge functions
    const payload = await req.json()
    const { invoice_id } = payload;
    
    if (!invoice_id) {
      throw new Error('Missing invoice_id');
    }

    // Get the invoice details
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*, brands(webhook_secret, website_url)') // Assuming a relation or you fetch brand separately
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) throw new Error('Invoice not found')

    // Find the webhook URL configured for this user (you might need a webhooks table)
    // For this example, let's assume you store it in a `webhooks` table
    const { data: webhook } = await supabaseClient
      .from('webhooks')
      .select('*')
      .eq('user_id', invoice.user_id)
      .single()

    if (!webhook || !webhook.payload_url) {
      return new Response(JSON.stringify({ success: false, message: 'No webhook configured for this merchant.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Send the POST request to the merchant's server
    const response = await fetch(webhook.payload_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mecopay-signature': invoice.brands?.webhook_secret || 'secret', // Ideally sign the payload
      },
      body: JSON.stringify({
        event: 'payment.completed',
        data: {
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
          amount: invoice.amount,
          status: invoice.status,
          trx_id: invoice.trx_id,
          customer_name: invoice.customer_name,
          customer_phone: invoice.customer_phone
        }
      })
    });

    return new Response(JSON.stringify({ success: true, status: response.status }), {
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
