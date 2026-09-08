import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  return new Response(JSON.stringify({
    url: Deno.env.get('SUPABASE_URL') ? 'set' : 'not set',
    anon: Deno.env.get('SUPABASE_ANON_KEY') ? 'set' : 'not set',
    service: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'set' : 'not set'
  }), { headers: { 'Content-Type': 'application/json' } })
})
