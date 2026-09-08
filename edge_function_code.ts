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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const payload = await req.json()
    
    // Generate secure keys
    const apiKey = 'mp_live_' + crypto.randomUUID().replace(/-/g, '')
    const webhookSecret = 'whsec_' + crypto.randomUUID().replace(/-/g, '')

    const { data, error } = await supabaseClient
      .from('brands')
      .insert({
        user_id: user.id,
        name: payload.name,
        website_url: payload.website_url,
        allow_telegram: payload.allow_telegram ?? false,
        allow_tally: payload.allow_tally ?? false,
        allow_facebook: payload.allow_facebook ?? false,
        allow_whatsapp: payload.allow_whatsapp ?? false,
        allow_drive: payload.allow_drive ?? false,
        allow_youtube: payload.allow_youtube ?? false,
        logo_url: payload.logo_url,
        support_email: payload.support_email,
        api_key: apiKey,
        webhook_secret: webhookSecret,
        verify_trx_id: payload.verify_trx_id ?? true,
        verify_phone: payload.verify_phone ?? false,
        merchant_api: payload.merchant_api ?? true,
        personal_api: payload.personal_api ?? false
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
