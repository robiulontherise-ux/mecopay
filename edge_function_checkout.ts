import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let payload: any = {};
    try {
      payload = await req.json();
    } catch (_) {
      throw new Error('Invalid JSON payload');
    }

    // 1. Authenticate Brand via API Key (Header or Payload)
    const authHeader = req.headers.get('Authorization');
    const apiKey = authHeader ? authHeader.replace(/Bearer\s+/i, '').trim() : payload.api_key;

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing Brand API Key. Please provide Authorization: Bearer <API_KEY> header or api_key in body.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Find Brand in Supabase
    const { data: brand, error: brandError } = await supabaseClient
      .from('brands')
      .select('*')
      .eq('api_key', apiKey)
      .maybeSingle();

    if (brandError || !brand) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid or deactivated Brand API Key.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const {
      order_id,
      order_type = 'digital', // 'digital' | 'physical_advance' | 'physical_cod'
      amount = 0,
      advance_amount = 0,
      total_amount = 0,
      courier_charge = 0,
      customer_name = 'Guest Customer',
      customer_phone = '',
      customer_email = '',
      customer_address = '',
      success_url = '',
      cancel_url = '',
      metadata = {}
    } = payload;

    if (!order_id || typeof order_id !== 'string' || !order_id.trim()) {
      return new Response(JSON.stringify({ success: false, error: "Validation Error: 'order_id' is mandatory and must be the client's unique order ID." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const invoiceNumber = 'INV-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);

    // =========================================================================
    // CASE 1: 100% Cash On Delivery (Physical COD - No gateway payment needed)
    // =========================================================================
    if (order_type === 'physical_cod' || amount === 0) {
      const { data: codInvoice, error: codErr } = await supabaseClient
        .from('invoices')
        .insert({
          user_id: brand.user_id,
          brand_id: brand.id,
          invoice_number: invoiceNumber,
          customer_name,
          customer_phone,
          customer_email,
          customer_address,
          amount: total_amount || amount || 0,
          status: 'cod_confirmed',
          product_type: 'physical_cod',
          metadata: {
            ...metadata,
            order_id,
            order_type: 'physical_cod',
            courier_charge: Number(courier_charge) || 0,
            cod_due: Number(total_amount || amount || 0) + Number(courier_charge || 0),
            cod_total: Number(total_amount || amount || 0) + Number(courier_charge || 0),
            auto_booked: true
          }
        })
        .select()
        .single();

      if (codErr) throw codErr;

      return new Response(JSON.stringify({
        success: true,
        order_type: 'physical_cod',
        status: 'cod_confirmed',
        invoice_id: codInvoice.id,
        invoice_number: codInvoice.invoice_number,
        message: 'Order placed successfully under 100% Cash on Delivery.',
        requires_payment: false,
        success_url: success_url || null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // =========================================================================
    // CASE 2 & 3: Advance COD or Digital Payment
    // =========================================================================
    const payableAmount = (order_type === 'physical_advance' && advance_amount > 0)
      ? advance_amount
      : amount;

    // Detect Gateway Mode: Merchant API vs Personal MFS
    const isMerchantMode = Boolean(brand.merchant_api && !brand.personal_api);
    const gatewayMode = isMerchantMode ? 'merchant_api' : 'personal_mfs';

    // Insert pending invoice
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .insert({
        user_id: brand.user_id,
        brand_id: brand.id,
        invoice_number: invoiceNumber,
        customer_name,
        customer_phone,
        customer_email,
        customer_address,
        amount: payableAmount,
        status: 'Pending',
        product_type: order_type,
        gateway_used: gatewayMode,
        success_url: success_url || '',
        metadata: {
          ...metadata,
          order_id,
          order_type,
          full_order_amount: total_amount || amount,
          advance_charged: payableAmount,
          courier_charge: Number(courier_charge) || 0,
          cod_due: Math.max(0, (Number(total_amount || amount) + Number(courier_charge || 0)) - Number(payableAmount)),
          brand_name: brand.name,
          gateway_mode: gatewayMode
        }
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Check Personal MFS Device Heartbeat (if Personal mode)
    let isDeviceOnline = true;
    if (!isMerchantMode) {
      const { data: deviceStatus } = await supabaseClient
        .from('device_status')
        .select('last_heartbeat_at')
        .eq('user_id', brand.user_id)
        .order('last_heartbeat_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (deviceStatus?.last_heartbeat_at) {
        const lastHeartbeat = new Date(deviceStatus.last_heartbeat_at).getTime();
        isDeviceOnline = (Date.now() - lastHeartbeat) < 120000; // 2 minutes window
      } else {
        isDeviceOnline = false;
      }
    }

    // Hosted Unified Checkout Page URL
    const appOrigin = Deno.env.get('APP_URL') || 'https://mecopay.space';
    const checkoutUrl = `${appOrigin}/pay?inv=${invoice.id}`;

    return new Response(JSON.stringify({
      success: true,
      order_type,
      gateway_mode: gatewayMode,
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      payable_amount: payableAmount,
      currency: 'BDT',
      checkout_url: checkoutUrl,
      gateway_online: isMerchantMode ? true : isDeviceOnline,
      message: 'Checkout session created successfully.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
