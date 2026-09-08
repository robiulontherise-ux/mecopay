import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const secret = url.searchParams.get('secret');
    const deviceId = url.searchParams.get('device_id');

    if (!userId || !secret || !deviceId) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify HMAC Secret
    const { data: profile } = await supabase
      .from('profiles')
      .select('hmac_secret')
      .eq('id', userId)
      .single();

    if (!profile || profile.hmac_secret !== secret) {
       return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
         status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
       });
    }

    // Update Device Status
    const { error } = await supabase
      .from('device_status')
      .upsert({
         user_id: userId,
         device_id: deviceId,
         connected: true,
         last_heartbeat_at: new Date().toISOString()
      }, { onConflict: 'user_id,device_id' });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
