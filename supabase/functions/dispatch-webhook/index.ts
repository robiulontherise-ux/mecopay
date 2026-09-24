import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Compute HMAC SHA-256 in standard Web Crypto (Deno native)
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

    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {
      throw new Error('Invalid JSON payload');
    }

    // Support both direct invocation and Supabase Database Webhook payload (record / old_record)
    let brandId = body.brand_id;
    let event = body.event || 'brand.settings_updated';
    let data = body.data || {};

    // If invoked via Supabase Database Webhook (Database > Webhooks):
    if (body.type === 'UPDATE' && body.table === 'brands' && body.record) {
      brandId = body.record.id;
      event = 'brand.settings_updated';
      data = {
        auto_courier_on_full_cod: body.record.auto_courier_on_full_cod,
        personal_api_active: body.record.personal_api,
        merchant_api_active: body.record.merchant_api
      };
    }

    if (!brandId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing brand_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Fetch registered webhooks for this brand
    const { data: webhooks, error: whError } = await supabaseClient
      .from('webhooks')
      .select('payload_url, webhook_secret')
      .eq('brand_id', brandId);

    if (whError) {
      return new Response(JSON.stringify({ success: false, error: whError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!webhooks || webhooks.length === 0) {
      return new Response(JSON.stringify({ success: true, delivered: false, message: 'No webhook registered for brand' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      ...data
    };
    const payloadString = JSON.stringify(payload);

    const deliveryResults = [];

    for (const wh of webhooks) {
      if (!wh.payload_url) continue;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'MecoPay-Edge-Dispatcher/1.0',
        'X-MecoPay-Event': event
      };

      if (wh.webhook_secret) {
        const signature = await createHmacSha256(wh.webhook_secret, payloadString);
        headers['X-MecoPay-Signature'] = signature;
      }

      try {
        const dispatchRes = await fetch(wh.payload_url, {
          method: 'POST',
          headers,
          body: payloadString,
          signal: AbortSignal.timeout(6000)
        });

        deliveryResults.push({
          url: wh.payload_url,
          status: dispatchRes.status,
          ok: dispatchRes.ok
        });
      } catch (err: any) {
        deliveryResults.push({
          url: wh.payload_url,
          error: err.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      delivered: deliveryResults.some(r => r.ok),
      results: deliveryResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
