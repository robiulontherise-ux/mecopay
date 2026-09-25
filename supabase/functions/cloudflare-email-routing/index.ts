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
    const cfZoneId = Deno.env.get('CLOUDFLARE_ZONE_ID') || ''
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN') || ''
    const emailWorkerName = Deno.env.get('CLOUDFLARE_EMAIL_WORKER_NAME') || 'mecopay-email-worker'

    if (!cfApiToken || !cfZoneId) {
      return new Response(JSON.stringify({ 
        error: 'CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID is not configured in Supabase Edge Secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // =========================================================================
    // ACTION: CREATE SPECIFIC LITERAL RULE (e.g. support@domain.com -> Worker)
    // =========================================================================
    if (action === 'create') {
      // 1. First, check if a rule already exists for this exact email to avoid duplicates
      const listRulesRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/email/routing/rules`,
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
          message: 'Email rule already exists and is active on Cloudflare.',
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
        `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/email/routing/rules`,
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
        const errorMsg = createData.errors?.[0]?.message || 'Failed to create Cloudflare email routing rule'
        return new Response(JSON.stringify({ 
          error: `Cloudflare API Error: ${errorMsg}`,
          details: createData.errors 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Business email ${cleanEmail} created successfully and routed to MecoPay Worker.`,
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
        `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/email/routing/rules`,
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
          `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/email/routing/rules/${targetRule.id}`,
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
        message: `Email rule for ${cleanEmail} deleted from Cloudflare.`
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
