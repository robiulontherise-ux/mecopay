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
    const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '') || payload.api_key;
    
    if (!apiKey) throw new Error('No API key provided');

    // Authenticate brand
    const { data: brand, error: brandError } = await supabaseClient
      .from('brands')
      .select('user_id, id')
      .eq('api_key', apiKey)
      .single()

    if (brandError || !brand) throw new Error('Invalid API key')

    // Create Invoice
    const invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .insert({
        user_id: brand.user_id,
        invoice_number: invoiceNumber,
        customer_name: payload.customer_name || 'Guest',
        customer_phone: payload.customer_phone || '',
        customer_email: payload.customer_email || '',
        amount: payload.amount || 0,
        status: 'Pending',
        payment_method: payload.payment_method || 'bKash', // bKash, Nagad
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError;

    // Check device status for online/offline
    const { data: deviceStatus } = await supabaseClient
      .from('device_status')
      .select('last_heartbeat_at')
      .eq('user_id', brand.user_id)
      .single();

    let isOnline = false;
    if (deviceStatus?.last_heartbeat_at) {
      const lastHeartbeat = new Date(deviceStatus.last_heartbeat_at).getTime();
      const now = new Date().getTime();
      // Online if heartbeat within last 90 seconds
      if (now - lastHeartbeat < 90000) {
        isOnline = true;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      checkout_url: `https://mecopay.app/checkout/${invoice.id}`,
      gateway_online: isOnline 
    }), {
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
