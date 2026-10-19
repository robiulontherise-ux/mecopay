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

    const metadata = invoice.metadata && typeof invoice.metadata === 'object' ? invoice.metadata : {};
    const event = invoice.status === 'cod_confirmed' ? 'order.courier_booked' : 'payment.completed';
    const productType = metadata.product_type || invoice.product_type || (event === 'order.courier_booked' ? 'physical_cod' : 'digital');
    const isDigital = productType === 'digital';
    const courier = metadata.courier || {
      provider: metadata.courier_provider || invoice.courier_provider || null,
      tracking_code: metadata.courier_tracking_code || invoice.courier_tracking_code || invoice.consignment_id || null,
      tracking_url: metadata.tracking_url || invoice.tracking_url || null
    };
    const webhookData = {
      invoice_no: invoice.id,
      order_id: metadata.order_id || invoice.order_id || null,
      product_name: metadata.product_name || invoice.product_name || null,
      product_id: metadata.product_id || invoice.product_id || null,
      product_type: productType,
      currency: metadata.currency || invoice.currency || null,
      amount: invoice.amount ?? metadata.amount ?? 0,
      product_price: metadata.product_price ?? invoice.metadata?.product_price ?? invoice.amount ?? 0,
      payable_amount: metadata.payable_amount ?? invoice.metadata?.payable_amount ?? invoice.amount ?? 0,
      total_amount: metadata.total_amount ?? invoice.total_amount ?? invoice.amount ?? 0,
      courier_charge: metadata.courier_charge ?? invoice.courier_charge ?? 0,
      cod_due: metadata.cod_due ?? invoice.cod_due ?? 0,
      success_url: metadata.success_url || invoice.success_url || invoice.redirect_link || null,
      status: event === 'order.courier_booked' ? 'cod_confirmed' : (productType === 'physical_advance' ? 'advance_paid' : 'paid'),
      ...(isDigital ? { delivery: {
        telegram_link: metadata.telegram_link || invoice.telegram_link || null,
        facebook_group_link: metadata.facebook_group_link || invoice.facebook_group_link || null,
        facebook_access_code: metadata.facebook_access_code || invoice.facebook_access_code || null,
        google_drive_link: metadata.google_drive_link || invoice.google_drive_link || null,
        success_url: metadata.success_url || invoice.success_url || null,
        digital_access: null
      } } : { courier })
    };
    const webhookPayload = { event, event_time: new Date().toISOString(), data: webhookData };
    const payloadString = JSON.stringify(webhookPayload);
    const secret = webhook.webhook_secret || invoice.brands?.webhook_secret || '';
    if (!secret) throw new Error('Webhook secret is not configured.');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signatureBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadString));
    const signature = Array.from(new Uint8Array(signatureBytes)).map((b) => b.toString(16).padStart(2, '0')).join('');

    const response = await fetch(webhook.payload_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MecoPay-Signature': signature,
        'X-MecoPay-Event': event,
        'User-Agent': 'MecoPay-Webhook-Dispatcher/2.0'
      },
      body: payloadString
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
