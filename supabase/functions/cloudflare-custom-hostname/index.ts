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
    const action = payload.action || 'create' // 'create' | 'verify' | 'delete'
    const rawDomain = (payload.domain || '').trim().toLowerCase()
    const cleanDomain = rawDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim()
    const brandId = payload.brand_id

    if (!cleanDomain) {
      return new Response(JSON.stringify({ error: 'Valid custom domain is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Read Cloudflare secrets from environment
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

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

    // ==========================================================
    // ACTION 1: CREATE CUSTOM HOSTNAME (Cloudflare for SaaS TLS)
    // ==========================================================
    if (action === 'create') {
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

      // If already exists on Cloudflare, fetch existing hostname details
      if (!cfResponse.ok) {
        // Error code 1406 / already exists
        const listRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames?hostname=${cleanDomain}`, {
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          }
        })
        const listData = await listRes.json()
        const existingHost = listData.result?.[0]

        if (existingHost) {
          // Update DB with existing hostname ID
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
          error: cfData.errors?.[0]?.message || 'Failed to create custom hostname in Cloudflare',
          details: cfData.errors
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const newHost = cfData.result
      const hostId = newHost.id
      const hostStatus = newHost.status // 'pending_validation'
      const sslStatus = newHost.ssl?.status // 'initializing' / 'pending_validation'

      // Save hostname ID and status to site_settings
      if (brandId) {
        await adminSupabase
          .from('site_settings')
          .update({
            custom_hostname_id: hostId,
            domain_status: hostStatus === 'active' && sslStatus === 'active' ? 'active' : 'pending_validation'
          })
          .or(`id.eq.${brandId},brand_id.eq.${brandId}`)
      }

      return new Response(JSON.stringify({
        ok: true,
        status: hostStatus,
        ssl_status: sslStatus,
        hostname_id: hostId,
        hostname: cleanDomain,
        cname_target: 'cname.mecopay.space',
        created_at: newHost.created_at
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ==========================================================
    // ACTION 2: VERIFY CUSTOM HOSTNAME & SSL STATUS
    // ==========================================================
    if (action === 'verify') {
      let hostnameId = payload.hostname_id

      // If no ID passed, look up via Cloudflare search by domain
      if (!hostnameId) {
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
        return new Response(JSON.stringify({
          ok: false,
          status: 'not_found',
          message: 'Hostname has not been provisioned yet. Please save the domain first.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const statusRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames/${hostnameId}`, {
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json'
        }
      })
      const statusData = await statusRes.json()

      if (!statusRes.ok) {
        return new Response(JSON.stringify({
          error: statusData.errors?.[0]?.message || 'Failed to check verification status'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const hostResult = statusData.result
      const isHostnameActive = hostResult.status === 'active'
      const isSslActive = hostResult.ssl?.status === 'active'
      const isFullyActive = isHostnameActive && isSslActive

      // If active, update database status
      if (brandId) {
        await adminSupabase
          .from('site_settings')
          .update({
            domain_status: isFullyActive ? 'active' : 'pending_validation'
          })
          .or(`id.eq.${brandId},brand_id.eq.${brandId}`)
      }

      return new Response(JSON.stringify({
        ok: true,
        status: hostResult.status,
        ssl_status: hostResult.ssl?.status,
        is_active: isFullyActive,
        hostname: cleanDomain,
        hostname_id: hostnameId,
        ssl_validation_errors: hostResult.ssl?.validation_errors || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ==========================================================
    // ACTION 3: DELETE CUSTOM HOSTNAME
    // ==========================================================
    if (action === 'delete') {
      let hostnameId = payload.hostname_id
      if (!hostnameId) {
        const listRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames?hostname=${cleanDomain}`, {
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          }
        })
        const listData = await listRes.json()
        hostnameId = listData.result?.[0]?.id
      }

      if (hostnameId) {
        await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames/${hostnameId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          }
        })
      }

      if (brandId) {
        await adminSupabase
          .from('site_settings')
          .update({
            custom_hostname_id: null,
            domain_status: 'none'
          })
          .or(`id.eq.${brandId},brand_id.eq.${brandId}`)
      }

      return new Response(JSON.stringify({ ok: true, deleted: cleanDomain }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
