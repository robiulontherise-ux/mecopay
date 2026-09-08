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

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const payload = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // MecoPay SMS Forwarder typically sends:
    // { "sender": "bKash", "message": "Cash In Tk 50.00 from 019... TrxID 9H7... etc" }
    
    // Attempt to extract TrxID (Basic extraction for storage)
    let trxIdExtracted = '';
    const msg = (payload.message || '').toUpperCase();
    const match = msg.match(/TRXID[:\s]*([A-Z0-9]+)/) || msg.match(/TXNID[:\s]*([A-Z0-9]+)/);
    if (match && match[1]) {
        trxIdExtracted = match[1];
    }

    const { error } = await supabase
      .from('sms_events')
      .insert({
         user_id: userId,
         sender: payload.sender || payload.from || 'Unknown',
         message: payload.message || payload.text || '',
         trx_id_extracted: trxIdExtracted,
         status: 'pending'
      });

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
