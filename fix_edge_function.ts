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

    let userId = searchParams.user_id || payload.user_id;
    let secret = searchParams.secret || payload.secret || searchParams['amp;secret'];
    
    if (!secret) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (key.includes('secret')) { secret = value; break; }
      }
    }

    userId = userId ? userId.trim() : null;
    secret = secret ? secret.trim() : null;

    if (!userId) {
       return new Response(JSON.stringify({ error: "Missing user_id" }), { status: 400, headers: corsHeaders });
    }

    const currentTime = new Date().toISOString();
    
    const { data: existing } = await supabaseClient
      .from('device_status')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    let dbError;
    // We only update last_heartbeat for now since status column is missing
    if (existing) {
      const { error } = await supabaseClient
        .from('device_status')
        .update({ last_heartbeat: currentTime })
        .eq('id', existing.id);
      dbError = error;
    } else {
      const { error } = await supabaseClient
        .from('device_status')
        .insert({ user_id: userId, last_heartbeat: currentTime });
      dbError = error;
    }

    if (dbError) {
       return new Response(JSON.stringify({ error: "Failed to save device status.", details: dbError }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, message: 'Heartbeat updated successfully', user_id: userId }), {
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
