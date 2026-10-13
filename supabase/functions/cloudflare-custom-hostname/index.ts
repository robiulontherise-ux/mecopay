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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? supabaseAnonKey

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized: Missing token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

    // ১. অথেনটিকেশন চেক: ফ্রন্টএন্ড ইউজার সেশন অথবা সুপাবেস ডাটাবেজ ট্রিগারের সার্ভিস রোল
    const token = authHeader.replace('Bearer ', '').trim()
    let isServiceRole = false
    let authenticatedUserId: string | null = null

    if (token === supabaseServiceKey) {
      isServiceRole = true
    } else {
      const { data: { user }, error: userError } = await adminSupabase.auth.getUser(token)
      if (userError || !user) {
        return new Response(JSON.stringify({ ok: false, error: 'Unauthorized: Invalid session' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      authenticatedUserId = user.id
    }

    const payload = await req.json()
    const action = payload.action || 'sync_brand'
    const brandId = payload.brand_id

    const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID') || ''
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN') || ''
    const cfZoneId = Deno.env.get('CLOUDFLARE_ZONE_ID') || ''
    const cfKvNamespaceId = Deno.env.get('CLOUDFLARE_KV_NAMESPACE_ID') || '209eb3cc321941e9b6f429e12a3e1640'

    // =========================================================================
    // ACTION 1: SYNC_BRAND
    // ১. গেটওয়ে ওয়ার্কারের জন্য: brand_apikey ও brand_id তে ফ্ল্যাগ সেভ
    // ২. সাবডোমেনের জন্য (যেমন: test.mecopay.space): website_service_active সেভ
    // ৩. কাস্টম ডোমেনের জন্য (যেমন: test.com): domain_status ও ট্র্যাকিং সেভ
    // =========================================================================
    if (action === 'sync_brand') {
      if (!brandId) {
        return new Response(JSON.stringify({ ok: false, error: 'brand_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // ১. brands টেবিল থেকে ডাটা ফেচ
      const { data: brand, error: bErr } = await adminSupabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .maybeSingle()

      if (bErr || !brand) {
        return new Response(JSON.stringify({ ok: false, error: 'Brand not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const clientId = brand.user_id || authenticatedUserId || ''

      // ২. site_settings টেবিল থেকে ডাটা ফেচ
      let siteSetting = null
      const { data: sData } = await adminSupabase
        .from('site_settings')
        .select('*')
        .or(`id.eq.${brandId},brand_id.eq.${brandId}`)
        .maybeSingle()

      if (sData) {
        siteSetting = sData
      } else if (clientId) {
        const { data: fallbackSite } = await adminSupabase
          .from('site_settings')
          .select('*')
          .eq('client_id', clientId)
          .maybeSingle()
        siteSetting = fallbackSite
      }

      // ৩. server_side_tracking টেবিল থেকে ডাটা ফেচ
      let trackingSetting = null
      const { data: tData } = await adminSupabase
        .from('server_side_tracking')
        .select('*')
        .eq('brand_id', brandId)
        .maybeSingle()

      if (tData) {
        trackingSetting = tData
      } else if (clientId) {
        const { data: fallbackTracking } = await adminSupabase
          .from('server_side_tracking')
          .select('*')
          .eq('client_id', clientId)
          .maybeSingle()
        trackingSetting = fallbackTracking
      }

      // 🎯 (১) গেটওয়ে ওয়ার্কারের জন্য KV ব্র্যান্ড অবজেক্ট (client_id, brand_id সহ pure booleans)
      const kvBrandData = {
        client_id: clientId,
        brand_id: brand.id,
        api_key: brand.api_key,
        personal_api: Boolean(brand.personal_api),
        merchant_api: Boolean(brand.merchant_api),
        international_api: Boolean(brand.international_api),
        full_cod_active: Boolean(brand.full_cod_active),
        auto_courier_on_full_cod: Boolean(brand.auto_courier_on_full_cod),
        auto_courier_on_advance: Boolean(brand.auto_courier_on_advance),
        updated_at: Math.floor(Date.now() / 1000)
      }

      // 🎯 (২) ডোমেন ও সাবডোমেন আলাদা ফরম্যাট
      // কাস্টম ডোমেন (যেমন: test.com)
      const rawCustomDomain = siteSetting?.domain || brand.website_url || null
      const cleanCustomDomain = rawCustomDomain
        ? rawCustomDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim().toLowerCase()
        : null

      // সাবডোমেন (যেমন: test.mecopay.space)
      const rawSubdomain = siteSetting?.subdomain || null
      const cleanSubdomain = rawSubdomain
        ? rawSubdomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim().toLowerCase()
        : null

      // ট্র্যাকিং অবজেক্ট (৬টি প্ল্যাটফর্ম)
      const trackingPayload = trackingSetting ? {
        client_id: clientId,
        brand_id: brand.id,
        // ১. Meta CAPI
        meta_enabled: Boolean(trackingSetting.meta_enabled),
        meta_pixel_id: trackingSetting.meta_pixel_id || '',
        meta_access_token: trackingSetting.meta_access_token || '',
        meta_test_code: trackingSetting.meta_test_code || '',
        // ২. Google Analytics 4 (GA4)
        ga4_enabled: Boolean(trackingSetting.ga4_enabled),
        ga4_measurement_id: trackingSetting.ga4_measurement_id || '',
        ga4_api_secret: trackingSetting.ga4_api_secret || '',
        // ৩. TikTok Events API
        tiktok_enabled: Boolean(trackingSetting.tiktok_enabled),
        tiktok_pixel_id: trackingSetting.tiktok_pixel_id || '',
        tiktok_access_token: trackingSetting.tiktok_access_token || '',
        // ৪. Twitter / X Conversion API
        twitter_enabled: Boolean(trackingSetting.twitter_enabled),
        twitter_pixel_id: trackingSetting.twitter_pixel_id || '',
        twitter_token: trackingSetting.twitter_token || '',
        // ৫. LinkedIn Conversions API
        linkedin_enabled: Boolean(trackingSetting.linkedin_enabled),
        linkedin_partner_id: trackingSetting.linkedin_partner_id || '',
        linkedin_access_token: trackingSetting.linkedin_access_token || '',
        // ৬. Pinterest Conversion API
        pinterest_enabled: Boolean(trackingSetting.pinterest_enabled),
        pinterest_tag_id: trackingSetting.pinterest_tag_id || '',
        pinterest_access_token: trackingSetting.pinterest_access_token || '',
        pinterest_ad_account_id: trackingSetting.pinterest_ad_account_id || ''
      } : null

      // 🎯 সাবডোমেনের জন্য KV কনফিগ (নো-কোড ওয়েবসাইট হোস্টিং + কাস্টম ডোমেন থাকলে অটো 301 রিডাইরেক্ট):
      const kvSubdomainData = cleanSubdomain ? {
        client_id: clientId,
        brand_id: brand.id,
        subdomain: cleanSubdomain,
        custom_domain: cleanCustomDomain || null,
        app_type: siteSetting?.app_type || 'no_code',
        origin_url: siteSetting?.origin_url || null,
        website_service_active: Boolean(siteSetting?.website_service_active ?? (siteSetting?.service_status === 'active')),
        tracking: trackingPayload,
        updated_at: Math.floor(Date.now() / 1000)
      } : null

      // 🎯 কাস্টম ডোমেনের জন্য KV কনফিগ (ডোমেইন রাউটিং + ওয়েবসাইট হোস্টিং + প্রক্সি):
      const kvCustomDomainData = cleanCustomDomain ? {
        client_id: clientId,
        brand_id: brand.id,
        domain: cleanCustomDomain,
        subdomain: cleanSubdomain || null,
        app_type: siteSetting?.app_type || 'custom',
        origin_url: siteSetting?.origin_url || null,
        domain_status: siteSetting?.domain_status === 'active' ? 'active' : 'inactive',
        website_service_active: Boolean(siteSetting?.website_service_active ?? (siteSetting?.service_status === 'active')),
        tracking: trackingPayload,
        updated_at: Math.floor(Date.now() / 1000)
      } : null

      // ক্লাউডফ্লেয়ার KV-তে পারফেক্ট রাইট
      if (cfAccountId && cfApiToken && cfKvNamespaceId) {
        // ১. API Key দিয়ে সেভ (গেটওয়ে ওয়ার্কারের জন্য)
        await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/storage/kv/namespaces/${cfKvNamespaceId}/values/brand_apikey:${brand.api_key}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(kvBrandData)
        })

        // ২. Brand ID দিয়ে সেভ (ট্রিগার বা সরাসরি চেকিংয়ের জন্য)
        await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/storage/kv/namespaces/${cfKvNamespaceId}/values/brand_id:${brand.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(kvBrandData)
        })

        // ৩. সাবডোমেন দিয়ে সেভ (domain_config:<subdomain>)
        if (cleanSubdomain && kvSubdomainData) {
          await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/storage/kv/namespaces/${cfKvNamespaceId}/values/domain_config:${cleanSubdomain}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${cfApiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(kvSubdomainData)
          })
        }

        // ৪. কাস্টম ডোমেন দিয়ে সেভ (domain_config:<custom_domain>)
        if (cleanCustomDomain && kvCustomDomainData) {
          await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/storage/kv/namespaces/${cfKvNamespaceId}/values/domain_config:${cleanCustomDomain}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${cfApiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(kvCustomDomainData)
          })
        }
      }

      return new Response(JSON.stringify({ 
        ok: true, 
        synced: true, 
        brand: kvBrandData,
        subdomain_config: kvSubdomainData,
        custom_domain_config: kvCustomDomainData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // =========================================================================
    // ACTION 2: CREATE CUSTOM HOSTNAME (ক্লাউডফ্লেয়ারে ডোমেইন রেজিস্টার)
    // =========================================================================
    const rawDomain = (payload.domain || '').trim().toLowerCase()
    const cleanDomain = rawDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim()

    if (action === 'create') {
      if (!cleanDomain) {
        return new Response(JSON.stringify({ ok: false, error: 'Valid domain is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostname: cleanDomain,
          ssl: {
            method: 'http',
            type: 'dv',
            settings: {
              min_tls_version: '1.2',
              http2: 'on'
            }
          }
        })
      })

      const cfData = await cfResponse.json()

      if (!cfResponse.ok) {
        const listRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames?hostname=${cleanDomain}`, {
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          }
        })
        const listData = await listRes.json()
        const existingHost = listData.result?.[0]

        if (existingHost) {
          if (brandId) {
            await adminSupabase
              .from('site_settings')
              .update({
                custom_hostname_id: existingHost.id,
                domain_status: existingHost.status === 'active' && existingHost.ssl?.status === 'active' ? 'active' : 'pending_validation'
              })
              .or(`id.eq.${brandId},brand_id.eq.${brandId}`)
          }

          return new Response(JSON.stringify({
            ok: true,
            status: existingHost.status,
            ssl_status: existingHost.ssl?.status,
            hostname_id: existingHost.id,
            hostname: cleanDomain,
            cname_target: 'cname.mecopay.space',
            message: 'Custom hostname already registered on Cloudflare.'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({
          ok: false,
          error: cfData.errors?.[0]?.message || 'Failed to create custom hostname'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const result = cfData.result
      if (brandId && result?.id) {
        await adminSupabase
          .from('site_settings')
          .update({
            custom_hostname_id: result.id,
            domain_status: result.status === 'active' && result.ssl?.status === 'active' ? 'active' : 'pending_validation'
          })
          .or(`id.eq.${brandId},brand_id.eq.${brandId}`)
      }

      return new Response(JSON.stringify({
        ok: true,
        hostname_id: result.id,
        hostname: result.hostname,
        status: result.status,
        ssl_status: result.ssl?.status,
        cname_target: 'cname.mecopay.space',
        ownership_verification: result.ownership_verification
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // =========================================================================
    // ACTION 3: VERIFY CUSTOM HOSTNAME (ক্লাউডফ্লেয়ার ডোমেইন স্ট্যাটাস আপডেট)
    // =========================================================================
    if (action === 'verify') {
      let hostnameId = payload.hostname_id

      if (!hostnameId && cleanDomain) {
        const listRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames?hostname=${cleanDomain}`, {
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          }
        })
        const listData = await listRes.json()
        hostnameId = listData.result?.[0]?.id
      }

      if (!hostnameId) {
        return new Response(JSON.stringify({ ok: false, error: 'Custom hostname ID not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames/${hostnameId}`, {
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json'
        }
      })
      const cfData = await cfRes.json()

      if (!cfRes.ok) {
        return new Response(JSON.stringify({ ok: false, error: cfData.errors?.[0]?.message || 'Failed to verify hostname' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const host = cfData.result
      const isActive = host.status === 'active' && host.ssl?.status === 'active'

      if (brandId) {
        await adminSupabase
          .from('site_settings')
          .update({
            custom_hostname_id: host.id,
            domain_status: isActive ? 'active' : 'pending_validation',
            ssl_status: host.ssl?.status || 'pending_validation'
          })
          .or(`id.eq.${brandId},brand_id.eq.${brandId}`)
      }

      return new Response(JSON.stringify({
        ok: true,
        is_active: isActive,
        status: host.status,
        ssl_status: host.ssl?.status,
        hostname: host.hostname
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ ok: false, error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
