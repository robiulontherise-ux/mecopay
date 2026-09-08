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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
    )

    const url = new URL(req.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    
    let payload: any = {};
    try {
      if (req.method === 'POST') {
        const text = await req.text();
        if (text) payload = JSON.parse(text);
      }
    } catch (e) {}

    const userId = searchParams.user_id || payload.user_id;
    let secret = searchParams.secret || payload.secret || req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!secret && searchParams['amp;secret']) {
      secret = searchParams['amp;secret'];
    }
    
    if (!secret) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (key.includes('secret')) { secret = value; break; }
      }
    }

    if (!userId || !secret) {
       throw new Error(`MISSING_PARAMS - Received userId: ${userId}, secret: ${secret}`);
    }

    // DEBUG: Let's check exactly what Supabase returns for this user
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
       throw new Error(`DB Error fetching profile: ${profileError.message} | Code: ${profileError.code}`);
    }

    if (!profile) {
       throw new Error(`Profile NOT FOUND in database for user_id: ${userId}`);
    }

    if (profile.hmac_secret !== secret) {
       throw new Error(`Secret Mismatch! DB Secret: '${profile.hmac_secret}', Provided: '${secret}'`);
    }

    // Update Device Status
    const { data: existing } = await supabaseClient
      .from('device_status')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    let dbError;
    const currentTime = new Date().toISOString();

    if (existing) {
      const { error } = await supabaseClient
        .from('device_status')
        .update({ last_heartbeat: currentTime, status: 'online' })
        .eq('id', existing.id);
      dbError = error;
    } else {
      const { error } = await supabaseClient
        .from('device_status')
        .insert({ user_id: userId, last_heartbeat: currentTime, status: 'online' });
      dbError = error;
    }

    if (dbError) throw new Error(`Device Status Insert/Update Error: ${dbError.message}`);

    return new Response(JSON.stringify({ success: true, message: 'Heartbeat registered' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
