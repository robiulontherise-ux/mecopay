/**
 * ============================================================================
 * MecoPay - Production API Worker (Cloudflare Worker - Final Synchronized)
 * High-Performance Edge API for /v1/create-checkout & /api/checkout
 * Compatible with Edge Function KV (`brand_apikey:` & `brand_id:`)
 * Multi-Currency & Gateway Fallback Ready
 * ============================================================================
 */

export default {
  async fetch(request, env, ctx) {
    // ১. CORS Preflight হ্যান্ডলিং
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // হেলথ চেক রুট
    if (url.pathname === '/health' || url.pathname === '/v1/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'MecoPay API Worker' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // ২. পে-লোড পার্স করা
      let body;
      try {
        body = await request.json();
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON payload format.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ৩. API Key নেওয়া (Authorization Header অথবা বডি থেকে)
      const authHeader = request.headers.get('Authorization') || request.headers.get('x-api-key') || '';
      let apiKey = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (!apiKey && body.api_key) {
        apiKey = String(body.api_key).trim();
      }

      if (!apiKey) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing Brand API Key. Provide via Authorization: Bearer <API_KEY> header or api_key in payload.'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ৪. KV ক্যাশ চেক (Edge Function ফরম্যাট: brand_apikey:<key> ও brand_id:<key>)
      const kv = env.MECOPAY_KV || env.SITE_CACHE;
      let brand = null;
      const primaryKvKey = `brand_apikey:${apiKey}`;

      if (kv) {
        // ১নং চেক: brand_apikey:API_KEY (Edge Function format)
        // ২নং চেক: brand_id:API_KEY (যদি কেউ Brand ID পাঠায়)
        // ৩নং চেক: brand_API_KEY (আগের ক্যাশ ফলব্যাক)
        brand = (await kv.get(primaryKvKey, 'json')) || 
                (await kv.get(`brand_id:${apiKey}`, 'json')) || 
                (await kv.get(`brand_${apiKey}`, 'json'));
      }

      // ফলব্যাক: KV-তে না থাকলে সরাসরি সুপাবেজ ডাটাবেজ থেকে ফেচ করা
      if (!brand) {
        const supabaseUrl = env.SUPABASE_URL;
        const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Server config error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing.');
        }

        // API Key দিয়ে সুপাবেজ brands টেবিলে কুয়েরি
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apiKey);
        const queryParam = isUuid ? `id=eq.${encodeURIComponent(apiKey)}` : `api_key=eq.${encodeURIComponent(apiKey)}`;

        const sbRes = await fetch(`${supabaseUrl}/rest/v1/brands?${queryParam}&select=*`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Accept': 'application/json',
          },
        });

        if (!sbRes.ok) {
          return new Response(JSON.stringify({ success: false, error: 'Database authentication failed.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const brands = await sbRes.json();
        if (!brands || brands.length === 0) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid or deactivated Brand API Key.' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const dbBrand = brands[0];
        
        // Edge Function KV ফরম্যাটের সাথে ১০০% একুরেট পারফেক্ট অবজেক্ট গঠন
        brand = {
          client_id: dbBrand.user_id,
          brand_id: dbBrand.id,
          api_key: dbBrand.api_key,
          personal_api: Boolean(dbBrand.personal_api),
          merchant_api: Boolean(dbBrand.merchant_api),
          international_api: Boolean(dbBrand.international_api),
          full_cod_active: Boolean(dbBrand.full_cod_active),
          auto_courier_on_full_cod: Boolean(dbBrand.auto_courier_on_full_cod),
          auto_courier_on_advance: Boolean(dbBrand.auto_courier_on_advance),
          updated_at: Math.floor(Date.now() / 1000)
        };

        // পরবর্তী রিকোয়েস্টগুলোর জন্য KV-তে পার্মানেন্ট ক্যাশ রাখা
        if (kv) {
          ctx.waitUntil(Promise.allSettled([
            kv.put(primaryKvKey, JSON.stringify(brand)),
            kv.put(`brand_id:${brand.brand_id}`, JSON.stringify(brand))
          ]));
        }
      }

      // ৫. ডেটা এক্সট্রাক্ট করা (ডায়নামিক কারেন্সি সাপোর্ট সহ)
      const {
        order_id,
        product_name = 'Custom Product',
        product_type = 'digital',
        currency = null,
        product_price = null,
        courier_charge = 0,
        advance_amount = 0,
        total_price = null,
        payable_amount = null,
        cod_due = null,
        // Legacy aliases are accepted for existing clients but never returned as public fields.
        price = null,
        amount = null,
        total_amount = null,
        customer_name = 'Customer',
        customer_phone = '',
        customer_email = '',
        customer_address = '',
        success_url = '',
        cancel_url = '',
        telegram_link = null,
        facebook_group_link = null,
        google_drive_link = null,
        cart_items = [],
        metadata = {}
      } = body;

      // কারেন্সি হ্যান্ডলিং: পে-লোডে পাঠালে হুবহু মান নেওয়া হবে (ইংরেজি, বাংলা বা প্রতীক)।
      // পে-লোডে কারেন্সি না পাঠালে খালি (null) থাকবে; ফ্রন্টএন্ড গেটওয়ে সেটিংস দেখে শো করবে।
      let orderCurrency = null;
      if (currency !== undefined && currency !== null && String(currency).trim() !== '') {
        const rawCur = String(currency).trim();
        orderCurrency = /^[a-zA-Z]{2,6}$/.test(rawCur) ? rawCur.toUpperCase() : rawCur;
      }

      // কার্ট ইন্টিগ্রিটি গার্ড (এক সাথে ডিজিটাল ও ফিজিক্যাল নেওয়া যাবে না)
      if (Array.isArray(cart_items) && cart_items.length > 0) {
        const hasDigital = cart_items.some(i => i.type === 'digital');
        const hasPhysical = cart_items.some(i => i.type !== 'digital');
        if (hasDigital && hasPhysical) {
          return new Response(JSON.stringify({
            success: false,
            error: 'কার্ট পলিসি এরর: ডিজিটাল ও ফিজিক্যাল পণ্য একসাথে এক অর্ডারে কেনা যাবে না।'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      const normalizedType = String(product_type).toLowerCase().trim();
      const isFullCod = (normalizedType === 'full_cod' || normalizedType === 'cod' || normalizedType === 'just_form' || normalizedType === 'physical_cod');
      const isAdvance = (normalizedType === 'advance' || normalizedType === 'physical_advance');
      const isFullPayment = (normalizedType === 'physical_full_payment' || normalizedType === 'physical_full' || normalizedType === 'full_payment');
      const isDigital = (normalizedType === 'digital');
      if (!isDigital && !isAdvance && !isFullPayment && !isFullCod) {
        return new Response(JSON.stringify({ success: false, error: 'Unsupported product_type. Use digital, physical_advance, physical_full_payment, or physical_cod.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const productPrice = Number(product_price ?? total_amount ?? price ?? amount ?? 0);
      const courierCharge = Number(courier_charge ?? 0);
      const derivedTotalPrice = productPrice + courierCharge;
      const successUrl = String(success_url || '').trim();
      // invoice_no is the only canonical invoice number.
      const invoiceNo = crypto.randomUUID();
      const supabaseUrl = env.SUPABASE_URL;
      const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
      const hmacSecret = String(env.HMAC_SECRET || '').trim();
      if (!hmacSecret) {
        return new Response(JSON.stringify({ success: false, error: 'Checkout signing secret is not configured.' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      const checkoutBaseUrl = (env.CHECKOUT_BASE_URL || 'https://www.mecopay.space').replace(/\/$/, '');

      // সেফ আইডেন্টিফায়ার (client_id ও brand_id সবসময় সঠিক থাকবে)
      const targetUserId = brand.client_id || brand.user_id;
      const targetBrandId = brand.brand_id || brand.id;

      // =======================================================================
      // কেস ১: ১০০% ক্যাশ অন ডেলিভারি (Full COD / Just Form)
      // =======================================================================
      if (isFullCod) {
        const canProcessFullCod = Boolean(
          brand.personal_api ||
          brand.merchant_api ||
          brand.international_api ||
          brand.auto_courier_on_full_cod ||
          brand.auto_courier_on_advance ||
          brand.full_cod_active
        );

        if (!canProcessFullCod) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Full COD সার্ভিস এই ব্র্যান্ডের জন্য সক্রিয় নেই। অনুগ্রহ করে ড্যাশবোর্ড থেকে পেমেন্ট গেটওয়ে, কুরিয়ার অথবা Full COD সার্ভিস চালু করুন।'
          }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const codInvoicePayload = {
          id: invoiceNo,
          user_id: targetUserId,
          brand_id: targetBrandId,
          customer_name,
          customer_phone,
          customer_email: customer_email || null,
          customer_address,
          product_name,
          product_type: 'physical_cod',
          amount: 0,
          status: 'cod_confirmed',
          courier_status: brand.auto_courier_on_full_cod ? 'queued_for_booking' : 'pending_confirmation',
          metadata: {
            ...metadata,
            currency: orderCurrency,
            success_url: successUrl || null,
            cancel_url: cancel_url || null,
            order_id: order_id || null,
            cart_items,
            product_price: productPrice,
            courier_charge: courierCharge,
            total_price: derivedTotalPrice,
            payable_amount: 0,
            cod_due: derivedTotalPrice,
            auto_courier: Boolean(brand.auto_courier_on_full_cod),
            placed_via: 'api_worker_full_cod',
            timestamp: new Date().toISOString()
          }
        };

        const insertRes = await fetch(`${supabaseUrl}/rest/v1/invoices`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(codInvoicePayload),
        });

        if (!insertRes.ok) {
          const errText = await insertRes.text();
          throw new Error(`Database order insertion failed: ${errText}`);
        }

        const insertedInvoices = await insertRes.json();
        const createdInvoice = insertedInvoices[0];

        return new Response(JSON.stringify({
          success: true,
          product_type: 'physical_cod',
          requires_payment: false,
          status: 'cod_confirmed',
          invoice_no: createdInvoice.id,
          product_price: productPrice,
          courier_charge: courierCharge,
          total_price: derivedTotalPrice,
          payable_amount: 0,
          cod_due: derivedTotalPrice,
          currency: orderCurrency,
          auto_courier_queued: Boolean(brand.auto_courier_on_full_cod),
          success_url: successUrl || null,
          message: 'অর্ডার সফলভাবে 100% Cash On Delivery হিসেবে নথিভুক্ত হয়েছে।'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // =======================================================================
      // কেস ২ ও ৩: গেটওয়ে পেমেন্ট প্রযোজ্য (Digital বা Advance + COD)
      // =======================================================================
      const hasPersonalGateway = Boolean(brand.personal_api === true);
      const hasMerchantGateway = Boolean(brand.merchant_api === true);
      const hasInternationalGateway = Boolean(brand.international_api === true);

      if (!hasPersonalGateway && !hasMerchantGateway && !hasInternationalGateway) {
        return new Response(JSON.stringify({
          success: false,
          error: 'অনলাইন পেমেন্ট গেটওয়ে নিষ্ক্রিয়! আপনার ব্র্যান্ডের জন্য Personal MFS, Merchant API অথবা International Gateway চালু থাকতে হবে।'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let payableAmount = 0;
      let calculatedDue = 0;

      if (isDigital) {
        payableAmount = productPrice;
        calculatedDue = 0;
      } else if (isAdvance) {
        const adv = Number(advance_amount || 0);
        payableAmount = adv > 0 ? adv : productPrice;
        calculatedDue = Math.max(0, (productPrice + courierCharge) - payableAmount);
      } else if (isFullPayment) {
        payableAmount = productPrice + courierCharge;
        calculatedDue = 0;
      }

      if (payableAmount <= 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'প্রদেয় অর্থের পরিমাণ (Payable Amount) অবশ্যই ০ এর বেশি হতে হবে।'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let gatewayMode = 'both';
      if (hasMerchantGateway && !hasPersonalGateway && !hasInternationalGateway) gatewayMode = 'merchant_api';
      else if (hasPersonalGateway && !hasMerchantGateway && !hasInternationalGateway) gatewayMode = 'personal_mfs';
      else if (hasInternationalGateway && !hasPersonalGateway && !hasMerchantGateway) gatewayMode = 'international_api';

      const invoicePayload = {
        id: invoiceNo,
        user_id: targetUserId,
        brand_id: targetBrandId,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        customer_address,
        product_name,
        product_type: isDigital ? 'digital' : (isFullPayment ? 'physical_full_payment' : 'physical_advance'),
        amount: payableAmount,
        status: 'Pending',
        gateway_used: gatewayMode,
        redirect_link: successUrl || null,
        metadata: {
          ...metadata,
          // Digital access links are stored only for digital products.
          ...(isDigital ? {
            telegram_link: telegram_link || metadata.telegram_link || null,
            facebook_group_link: facebook_group_link || metadata.facebook_group_link || null,
            google_drive_link: google_drive_link || metadata.google_drive_link || null,
          } : {}),
          currency: orderCurrency,
          order_id: order_id || null,
          cart_items,
          courier_charge: courierCharge,
          product_price: productPrice,
          total_price: derivedTotalPrice,
          payable_amount: payableAmount,
          cod_due: calculatedDue,
          gateway_mode: gatewayMode,
          success_url: successUrl || null,
          cancel_url: cancel_url || null,
          created_via: 'api_worker'
        }
      };

      const invRes = await fetch(`${supabaseUrl}/rest/v1/invoices`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(invoicePayload),
      });

      if (!invRes.ok) {
        const errText = await invRes.text();
        throw new Error(`Failed to create checkout invoice: ${errText}`);
      }

      const createdList = await invRes.json();
      const invoice = createdList[0];

      // ক্রিপ্টোগ্রাফিক HMAC-SHA256 সাইন করা
      const timestamp = Math.floor(Date.now() / 1000);
      const signatureData = `${invoice.id}|${payableAmount}|${targetBrandId}|${timestamp}`;
      const signature = await generateHmacSha256(hmacSecret, signatureData);

      const checkoutUrl = `${checkoutBaseUrl}/pay?inv=${encodeURIComponent(invoice.id)}&sig=${signature}&ts=${timestamp}`;

      return new Response(JSON.stringify({
        success: true,
        product_type: isDigital ? 'digital' : (isFullPayment ? 'physical_full_payment' : 'physical_advance'),
        requires_payment: true,
        invoice_no: invoice.id,
        product_price: productPrice,
        courier_charge: courierCharge,
        total_price: derivedTotalPrice,
        payable_amount: payableAmount,
        cod_due: calculatedDue,
        currency: orderCurrency,
        checkout_url: checkoutUrl,
        success_url: successUrl || null,
        gateway_options: {
          personal_mfs: hasPersonalGateway,
          merchant_pgw: hasMerchantGateway,
          international_pgw: hasInternationalGateway,
          mode: gatewayMode
        },
        message: 'Checkout সেশন সফলভাবে তৈরি হয়েছে।'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message || 'Internal API Worker Error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
};

/**
 * Native Web Crypto HMAC-SHA256 ফাংশন
 */
async function generateHmacSha256(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
