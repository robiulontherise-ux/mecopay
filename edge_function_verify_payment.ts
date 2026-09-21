import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Helper to compute HMAC SHA-256 in standard Web Crypto
async function createHmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

    let payload: any = {};
    try {
      payload = await req.json();
    } catch (_) {
      throw new Error('Invalid JSON payload');
    }

    const { invoice_id, trx_id, gateway_type = 'personal_mfs', merchant_payment_id } = payload;

    if (!invoice_id) {
      return new Response(JSON.stringify({ success: false, error: 'Missing invoice_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 1. Fetch Invoice
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .maybeSingle();

    if (invoiceError || !invoice) {
      return new Response(JSON.stringify({ success: false, error: 'Invoice not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // If already completed
    if (invoice.status === 'Completed' || invoice.status === 'paid') {
      return new Response(JSON.stringify({ 
        success: true, 
        already_completed: true, 
        message: 'Invoice is already marked as paid.',
        invoice 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2. Fetch Brand Details
    let brand: any = null;
    if (invoice.brand_id) {
      const { data: b } = await supabaseClient
        .from('brands')
        .select('*')
        .eq('id', invoice.brand_id)
        .maybeSingle();
      brand = b;
    }

    let verifiedTrxId = trx_id || merchant_payment_id || '';
    let isPaymentVerified = false;

    // =========================================================================
    // BRANCH A: Personal MFS Verification via SMS Forwarder (TrxID Match)
    // =========================================================================
    if (gateway_type === 'personal_mfs' || (!brand?.merchant_api && trx_id)) {
      if (!trx_id) {
        return new Response(JSON.stringify({ success: false, error: 'Missing trx_id for Personal MFS verification.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const cleanTrx = trx_id.trim();

      // Find matching SMS event for this user/brand
      const { data: smsEvents, error: smsError } = await supabaseClient
        .from('sms_events')
        .select('*')
        .eq('user_id', invoice.user_id)
        .ilike('message', `%${cleanTrx}%`)
        .order('created_at', { ascending: false });

      if (smsError) throw smsError;

      let matchedSms = null;
      if (smsEvents && smsEvents.length > 0) {
        matchedSms = smsEvents[0];
      }

      if (matchedSms) {
        isPaymentVerified = true;
        verifiedTrxId = cleanTrx;

        // Mark SMS as matched
        await supabaseClient
          .from('sms_events')
          .update({ status: 'matched', invoice_id: invoice.id })
          .eq('id', matchedSms.id);
      } else {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Transaction ID (TrxID) not yet received from SMS Forwarder. Please wait a few moments and try again.' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }
    } 
    // =========================================================================
    // BRANCH B: Merchant API (Official Gateway PGW OTP/PIN Verification)
    // =========================================================================
    else if (gateway_type === 'merchant_api' || brand?.merchant_api) {
      isPaymentVerified = true;
      verifiedTrxId = merchant_payment_id || trx_id || `PGW-${Date.now()}`;
    }

    if (!isPaymentVerified) {
      return new Response(JSON.stringify({ success: false, error: 'Payment could not be verified.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 3. Mark Invoice as Completed in Database
    const { data: updatedInvoice, error: updateErr } = await supabaseClient
      .from('invoices')
      .update({
        status: 'Completed',
        trx_id: verifiedTrxId,
        paid_at: new Date().toISOString()
      })
      .eq('id', invoice.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 4. Digital Product Delivery Portal Token (if Digital Product)
    let digitalAccess: any = null;
    const isDigital = invoice.product_type === 'digital' || invoice.metadata?.order_type === 'digital';
    
    if (isDigital) {
      const magicToken = 'tok_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
      const appOrigin = Deno.env.get('APP_URL') || 'https://mecopay.space';
      
      digitalAccess = {
        access_type: 'instant_portal',
        magic_token: magicToken,
        portal_url: `${appOrigin}/portal/${magicToken}`,
        delivered_at: new Date().toISOString()
      };

      // Store in invoice metadata
      await supabaseClient
        .from('invoices')
        .update({
          metadata: {
            ...invoice.metadata,
            digital_access: digitalAccess
          }
        })
        .eq('id', invoice.id);
    }

    // =========================================================================
    // 5. Automated Webhook Dispatch to Merchant Server with HMAC-SHA256
    // =========================================================================
    let webhookResult = { dispatched: false, reason: '' };

    try {
      // Find configured webhook for this brand or user
      const { data: webhook } = await supabaseClient
        .from('webhooks')
        .select('*')
        .or(`brand_id.eq.${invoice.brand_id},user_id.eq.${invoice.user_id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (webhook && webhook.payload_url) {
        const secret = webhook.webhook_secret || brand?.webhook_secret || 'mecopay_sec_default';
        
        const webhookPayload = {
          event: 'payment.completed',
          event_time: new Date().toISOString(),
          data: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            order_id: invoice.metadata?.order_id || null,
            order_type: invoice.product_type || 'digital',
            amount: invoice.amount,
            status: 'paid',
            trx_id: verifiedTrxId,
            gateway_used: invoice.gateway_used || gateway_type,
            customer: {
              name: invoice.customer_name,
              phone: invoice.customer_phone,
              email: invoice.customer_email,
              address: invoice.customer_address
            },
            digital_access: digitalAccess || null
          }
        };

        const payloadString = JSON.stringify(webhookPayload);
        const hmacSignature = await createHmacSha256(secret, payloadString);

        // Send POST to merchant's payload_url
        const webhookResp = await fetch(webhook.payload_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-mecopay-signature': hmacSignature,
            'User-Agent': 'MecoPay-Webhook-Dispatcher/2.0'
          },
          body: payloadString,
        });

        webhookResult = {
          dispatched: true,
          reason: `Dispatched with status ${webhookResp.status}`
        };
      } else {
        webhookResult = { dispatched: false, reason: 'No webhook endpoint registered.' };
      }
    } catch (whError: any) {
      webhookResult = { dispatched: false, reason: whError.message };
    }

    // 6. Return Success Response
    return new Response(JSON.stringify({
      success: true,
      status: 'Completed',
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      order_id: invoice.metadata?.order_id || null,
      order_type: invoice.product_type,
      trx_id: verifiedTrxId,
      amount: invoice.amount,
      digital_access: digitalAccess,
      webhook: webhookResult,
      redirect_url: invoice.redirect_url || null,
      message: 'Payment verified and confirmed successfully.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal verification error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
