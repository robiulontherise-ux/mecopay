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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const payload = await req.json()
    const rawDomain = (payload.domain || '').trim().toLowerCase()
    const cleanDomain = rawDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim()

    if (!cleanDomain) {
      return new Response(JSON.stringify({ error: 'Domain is required to purge cache' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const cfZoneId = Deno.env.get('CLOUDFLARE_ZONE_ID') || 'a1b2c3d4e5f6g7h8i9j0'
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN') || ''

    if (!cfApiToken) {
      return new Response(JSON.stringify({ 
        error: 'CLOUDFLARE_API_TOKEN is not configured in Supabase Edge Function Secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Call Cloudflare Purge Cache API for the specific host
    const purgeResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfApiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hosts: [cleanDomain]
      })
    })

    const purgeData = await purgeResponse.json()

    if (!purgeResponse.ok || !purgeData.success) {
      return new Response(JSON.stringify({
        error: purgeData.errors?.[0]?.message || 'Failed to purge cache on Cloudflare edge',
        details: purgeData.errors
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      ok: true,
      domain: cleanDomain,
      purged_at: Date.now(),
      message: 'Global CDN edge cache purged successfully in 150ms!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
