import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * MecoPay Payment Link & Delivery Edge Function
 * - Handles payment link retrieval
 * - Handles invoice creation for social/direct-link customers
 * - Handles payment verification (TrxID matching against merchant's SMS events)
 * - Returns instant Delivery Payload for Telegram & Tally upon verification
 */
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
    const { action } = payload;

    // ==========================================
    // ACTION 1: Get Payment Link Details by Slug
    // ==========================================
    if (action === 'get_link') {
      const { slug } = payload;
      if (!slug) throw new Error('Slug is required');

      const { data: link, error } = await supabaseClient
        .from('payment_links')
        .select(`
          id,
          user_id,
          brand_id,
          title,
          description,
          amount,
          advance_amount,
          product_type,
          delivery_channel,
          delivery_config,
          slug,
          is_active
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error || !link) {
        throw new Error('Payment link not found or inactive');
      }

      // Return public product information (hide sensitive merchant credentials)
      return new Response(JSON.stringify({
        success: true,
        data: {
          id: link.id,
          title: link.title,
          description: link.description,
          amount: link.amount,
          advance_amount: link.advance_amount,
          product_type: link.product_type, // 'digital', 'advance', 'cod'
          delivery_channel: link.delivery_channel, // 'telegram' | 'tally' | 'drive' | 'custom'
          slug: link.slug
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ==========================================
    // ACTION 2: Create Checkout Invoice from Link
    // ==========================================
    if (action === 'create_invoice') {
      const { link_id, customer_name, customer_phone, customer_email, gateway_used } = payload;
      if (!link_id || !customer_phone) {
        throw new Error('Missing link_id or customer_phone');
      }

      const { data: link, error: linkErr } = await supabaseClient
        .from('payment_links')
        .select('*')
        .eq('id', link_id)
        .single();

      if (linkErr || !link) throw new Error('Payment link not found');

      // Determine amount to charge
      // If physical advance -> advance_amount, if digital -> full amount, if COD -> 0
      let payableAmount = link.amount;
      if (link.product_type === 'advance' && link.advance_amount) {
        payableAmount = link.advance_amount;
      } else if (link.product_type === 'cod') {
        payableAmount = 0;
      }

      const invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);

      const { data: invoice, error: invErr } = await supabaseClient
        .from('invoices')
        .insert({
          user_id: link.user_id,
          brand_id: link.brand_id,
          payment_link_id: link.id,
          invoice_number: invoiceNumber,
          customer_name: customer_name || 'Valued Customer',
          customer_phone: customer_phone,
          customer_email: customer_email || null,
          amount: payableAmount,
          total_product_price: link.amount,
          status: payableAmount === 0 ? 'Completed' : 'Pending',
          gateway_used: gateway_used || 'bKash',
          product_type: link.product_type,
          delivery_channel: link.delivery_channel,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (invErr) throw invErr;

      return new Response(JSON.stringify({
        success: true,
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        payable_amount: payableAmount,
        status: invoice.status,
        checkout_url: `https://mecopay.app/checkout/${invoice.id}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ==========================================
    // ACTION 3: Verify Payment & Deliver Asset (Telegram / Tally)
    // ==========================================
    if (action === 'verify_payment') {
      const { invoice_id, trx_id } = payload;
      if (!invoice_id || !trx_id) {
        throw new Error('Missing invoice_id or trx_id');
      }

      // 1. Fetch Invoice
      const { data: invoice, error: invErr } = await supabaseClient
        .from('invoices')
        .select(`
          *,
          payment_links (
            id,
            title,
            delivery_channel,
            delivery_config
          )
        `)
        .eq('id', invoice_id)
        .single();

      if (invErr || !invoice) throw new Error('Invoice not found');
      
      // If already verified, return delivery payload directly
      let isVerified = invoice.status === 'Completed';

      if (!isVerified) {
        // Match SMS TrxID against merchant's pending SMS events
        const { data: smsEvents } = await supabaseClient
          .from('sms_events')
          .select('*')
          .eq('user_id', invoice.user_id)
          .ilike('message', `%${trx_id.trim()}%`)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        let matchedSms = null;
        if (smsEvents && smsEvents.length > 0) {
          const expectedProvider = (invoice.gateway_used || '').toLowerCase();
          for (const sms of smsEvents) {
            const sender = (sms.sender || '').toLowerCase();
            const msg = (sms.message || '').toLowerCase();
            if (sender.includes(expectedProvider) || msg.includes(expectedProvider)) {
              matchedSms = sms;
              break;
            }
          }
        }

        if (!matchedSms) {
          return new Response(JSON.stringify({
            success: false,
            message: 'TrxID could not be verified with incoming payment records yet. Please ensure exact TrxID.'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        // Mark invoice completed & match SMS
        await supabaseClient
          .from('invoices')
          .update({
            status: 'Completed',
            trx_id: trx_id.trim(),
            verified_at: new Date().toISOString()
          })
          .eq('id', invoice.id);

        await supabaseClient
          .from('sms_events')
          .update({ status: 'matched', invoice_id: invoice.id })
          .eq('id', matchedSms.id);
      }

      // Build specific Delivery Payload for Telegram or Tally
      const deliveryChannel = invoice.delivery_channel || invoice.payment_links?.delivery_channel || 'telegram';
      const config = invoice.payment_links?.delivery_config || {};

      let deliveryData: Record<string, any> = {
        channel: deliveryChannel,
        product_title: invoice.payment_links?.title || 'Digital Product',
        customer_name: invoice.customer_name,
        invoice_number: invoice.invoice_number,
        amount_paid: invoice.amount
      };

      if (deliveryChannel === 'telegram') {
        // Telegram channel/group invite link or bot access
        deliveryData = {
          ...deliveryData,
          telegram_invite_link: config.telegram_invite_link || 'https://t.me/+SampleVIPInviteLink',
          telegram_channel_name: config.telegram_channel_name || 'Exclusive VIP Community',
          instructions: 'Click the button below to join the private Telegram channel/group. This invite is active for your verified purchase.'
        };
      } else if (deliveryChannel === 'tally') {
        // Tally form URL (can embed parameters like customer name, phone, invoice_number)
        const baseUrl = config.tally_form_url || 'https://tally.so/r/sample';
        const separator = baseUrl.includes('?') ? '&' : '?';
        const prefilledTallyUrl = `${baseUrl}${separator}name=${encodeURIComponent(invoice.customer_name || '')}&phone=${encodeURIComponent(invoice.customer_phone || '')}&invoice=${encodeURIComponent(invoice.invoice_number || '')}`;

        deliveryData = {
          ...deliveryData,
          tally_form_url: prefilledTallyUrl,
          tally_form_id: config.tally_form_id || null,
          embed_allowed: config.embed_allowed ?? true,
          instructions: 'Your payment is confirmed. Please fill in your onboarding / briefing form below.'
        };
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Payment verified and access delivered successfully.',
        delivery: deliveryData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    throw new Error('Invalid action specified');

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
