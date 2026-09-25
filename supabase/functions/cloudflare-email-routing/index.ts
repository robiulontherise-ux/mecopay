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

    // 1. Strict Authentication Check
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
    const action = payload.action || 'create' // 'create' | 'delete' | 'list'
    const rawEmail = (payload.email_address || '').trim().toLowerCase()
    const rawDomain = (payload.domain || '').trim().toLowerCase()
    const brandId = payload.brand_id

    const cleanDomain = rawDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim()
    const cleanEmail = rawEmail.replace(/[^a-z0-9._%+-@]/g, '').trim()

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanDomain) {
      return new Response(JSON.stringify({ error: 'Valid email address and domain are required (e.g. support@yourbrand.com)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify email domain matches the brand's connected custom domain
    const emailDomainPart = cleanEmail.split('@')[1]
    if (emailDomainPart !== cleanDomain) {
      return new Response(JSON.stringify({ 
        error: `Email domain (@${emailDomainPart}) does not match your active custom domain (@${cleanDomain})` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Strict Security Ownership Check: Verify that user owns this brand & domain in site_settings
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)
    let domainCheckQuery = adminSupabase
      .from('site_settings')
      .select('id, client_id, brand_id, domain')
      .eq('client_id', user.id)
      .eq('domain', cleanDomain)

    if (brandId) {
      domainCheckQuery = domainCheckQuery.or(`brand_id.eq.${brandId},id.eq.${brandId}`)
    }

    const { data: verifiedSite, error: siteCheckErr } = await domainCheckQuery.maybeSingle()
    if (siteCheckErr || !verifiedSite) {
      return new Response(JSON.stringify({ 
        error: 'Security verification failed: You do not own this custom domain under this brand.' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Read Cloudflare Environment Secrets
    const defaultZoneId = Deno.env.get('CLOUDFLARE_ZONE_ID') || ''
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN') || ''
    let emailWorkerName = Deno.env.get('CLOUDFLARE_EMAIL_WORKER_NAME') || ''

    if (!cfApiToken) {
      return new Response(JSON.stringify({ 
        error: 'CLOUDFLARE_API_TOKEN is not configured in Supabase Edge Secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Dynamic Zone Lookup: Search Cloudflare for the zone matching the custom domain (e.g. rsgedu.online)
    let targetZoneId = defaultZoneId
    try {
      const zoneLookupRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones?name=${cleanDomain}`,
        {
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const zoneLookupData = await zoneLookupRes.json()
      if (zoneLookupData.result && zoneLookupData.result.length > 0) {
        targetZoneId = zoneLookupData.result[0].id
      }
    } catch (zErr) {
      console.warn('Zone dynamic lookup notice:', zErr)
    }

    if (!targetZoneId) {
      return new Response(JSON.stringify({ 
        error: `Could not find Cloudflare Zone for domain ${cleanDomain}. Ensure zone exists on your Cloudflare account.` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Auto-discover active email worker from existing rules if not provided in env
    try {
      const existingRulesRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${targetZoneId}/email/routing/rules`,
        {
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const existingRulesData = await existingRulesRes.json()
      if (existingRulesData.result && Array.isArray(existingRulesData.result)) {
        for (const r of existingRulesData.result) {
          const wAction = r.actions?.find((a: any) => a.type === 'worker')
          if (wAction && wAction.value && wAction.value[0]) {
            emailWorkerName = wAction.value[0]
            break
          }
        }
      }
    } catch (wErr) {
      console.warn('Worker discovery notice:', wErr)
    }

    if (!emailWorkerName) {
      emailWorkerName = 'mecopay-email-worker'
    }

    // =========================================================================
    // ACTION: CREATE SPECIFIC LITERAL RULE (e.g. support@domain.com -> Worker)
    // =========================================================================
    if (action === 'create') {
      // 1. First, check if a rule already exists for this exact email to avoid duplicates
      const listRulesRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${targetZoneId}/email/routing/rules`,
        {
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const listData = await listRulesRes.json()

      const existingRule = listData.result?.find((r: any) => 
        r.matchers?.some((m: any) => m.field === 'to' && m.value?.toLowerCase() === cleanEmail)
      )

      if (existingRule) {
        return new Response(JSON.stringify({
          success: true,
          message: `MecoPay Business Email ${cleanEmail} is active and ready.`,
          rule_id: existingRule.id,
          email_address: cleanEmail,
          domain: cleanDomain
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 2. Create the exact literal rule for this specific mailbox
      const createRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${targetZoneId}/email/routing/rules`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: `MecoPay Mailbox: ${cleanEmail}`,
            enabled: true,
            priority: 0,
            matchers: [
              {
                type: 'literal',
                field: 'to',
                value: cleanEmail
              }
            ],
            actions: [
              {
                type: 'worker',
                value: [emailWorkerName]
              }
            ]
          })
        }
      )

      const createData = await createRes.json()

      if (!createRes.ok || !createData.success) {
        const errorMsg = createData.errors?.[0]?.message || 'Failed to create email routing rule'
        return new Response(JSON.stringify({ 
          error: `Delivery Routing Error: ${errorMsg}`,
          details: createData.errors 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Business email ${cleanEmail} created successfully and routed to MecoPay Webmail.`,
        rule_id: createData.result?.id,
        email_address: cleanEmail,
        domain: cleanDomain
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // =========================================================================
    // ACTION: DELETE RULE
    // =========================================================================
    if (action === 'delete') {
      const listRulesRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${targetZoneId}/email/routing/rules`,
        {
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const listData = await listRulesRes.json()
      const targetRule = listData.result?.find((r: any) => 
        r.matchers?.some((m: any) => m.field === 'to' && m.value?.toLowerCase() === cleanEmail)
      )

      if (targetRule) {
        await fetch(
          `https://api.cloudflare.com/client/v4/zones/${targetZoneId}/email/routing/rules/${targetRule.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${cfApiToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Email rule for ${cleanEmail} deleted.`
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Unsupported action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
