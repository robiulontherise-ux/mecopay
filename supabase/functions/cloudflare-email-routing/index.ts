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

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    const { data: { user }, error: userError } = await adminSupabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: `Unauthorized user session: ${userError?.message || 'Invalid JWT'}` }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const payload = await req.json()
    const action = payload.action || 'create'
    const rawEmail = (payload.email_address || '').trim().toLowerCase()
    const rawDomain = (payload.domain || '').trim().toLowerCase()
    const brandId = payload.brand_id

    const cleanDomain = rawDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim()
    const cleanEmail = rawEmail.replace(/[^a-z0-9._%+-@]/g, '').trim()

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanDomain) {
      return new Response(JSON.stringify({ error: 'Valid email address and domain are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Read Cloudflare Environment Secrets
    const defaultZoneId = Deno.env.get('CLOUDFLARE_ZONE_ID') || ''
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN') || ''
    let cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID') || ''
    let emailWorkerName = Deno.env.get('CLOUDFLARE_EMAIL_WORKER_NAME') || 'mecopay-email-worker'

    if (!cfApiToken) {
      return new Response(JSON.stringify({ 
        error: 'CLOUDFLARE_API_TOKEN is not configured in Supabase Edge Secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Auto-discover Account ID if not set in env
    if (!cfAccountId) {
      try {
        const accRes = await fetch('https://api.cloudflare.com/client/v4/accounts?page=1&per_page=1', {
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          }
        })
        const accData = await accRes.json()
        if (accData.result && accData.result.length > 0) {
          cfAccountId = accData.result[0].id
        }
      } catch (aErr) {
        console.warn('Account lookup notice:', aErr)
      }
    }

    // Dynamic Zone Lookup
    let targetZoneId = ''
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
      console.warn('Zone lookup error:', zErr)
    }

    // 🔥 AUTOMATIC ZONE CREATION: If zone doesn't exist, create it on Cloudflare!
    if (!targetZoneId && cfAccountId) {
      try {
        const createZoneRes = await fetch('https://api.cloudflare.com/client/v4/zones', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: cleanDomain,
            account: { id: cfAccountId },
            jump_start: true,
            type: 'full'
          })
        })
        const createZoneData = await createZoneRes.json()
        if (createZoneData.result?.id) {
          targetZoneId = createZoneData.result.id
        }
      } catch (cZoneErr) {
        console.warn('Auto create zone notice:', cZoneErr)
      }
    }

    if (!targetZoneId) {
      targetZoneId = defaultZoneId
    }

    if (!targetZoneId) {
      return new Response(JSON.stringify({ 
        error: `Could not find or create Cloudflare Zone for domain ${cleanDomain}. Ensure Cloudflare API Token has Zone.Zone Edit permission.` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 🔥 AUTOMATIC ONBOARDING: Ensure Email Routing is enabled on this zone!
    try {
      await fetch(
        `https://api.cloudflare.com/client/v4/zones/${targetZoneId}/email/routing/enable`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (onboardErr) {
      console.warn('Email routing auto-enable notice:', onboardErr)
    }

    // Auto-discover worker name if exists
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
    } catch (_) {}

    // ACTION: CREATE
    if (action === 'create') {
      // 1. Check if rule already exists
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
          rule_id: existingRule.id
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 2. Create rule on Cloudflare
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
            matchers: [{ type: 'literal', field: 'to', value: cleanEmail }],
            actions: [{ type: 'worker', value: [emailWorkerName] }]
          })
        }
      )

      const createData = await createRes.json()
      if (!createRes.ok || !createData.success) {
        const errorDetail = createData.errors?.[0]?.message || 'Failed to create Cloudflare routing rule'
        return new Response(JSON.stringify({ error: errorDetail }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({
        success: true,
        message: `MecoPay Email Routing rule created successfully on Cloudflare!`,
        rule_id: createData.result?.id
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ACTION: DELETE
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
      const ruleToDelete = listData.result?.find((r: any) => 
        r.matchers?.some((m: any) => m.field === 'to' && m.value?.toLowerCase() === cleanEmail)
      )

      if (ruleToDelete) {
        await fetch(
          `https://api.cloudflare.com/client/v4/zones/${targetZoneId}/email/routing/rules/${ruleToDelete.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${cfApiToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Unsupported action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Edge Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
