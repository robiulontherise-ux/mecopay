import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify User from Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch Master Oracle Config safely from Database using Service Role (Bypassing public RLS)
    const { data: config, error: configError } = await supabase
      .from("headless_server_config")
      .select("*")
      .eq("id", "MASTER_CONFIG")
      .maybeSingle();

    const serverIp = config?.server_ip || "129.225.87.244";
    const serverPort = config?.server_port || 3333;
    const currentSecret = config?.api_secret_key || "meco_sec_live_99x77a88b";

    const body = await req.json();
    const { action } = body;

    // ACTION A: Admin Summary (Get RAM, Uptime, Active Sessions)
    if (action === "admin_summary") {
      const isAdmin = user.email === Deno.env.get("ADMIN_EMAIL") || user.email === "robiulontherise@gmail.com";
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch(`http://${serverIp}:${serverPort}/admin/summary`, {
          headers: { "x-gateway-secret": currentSecret },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!resp.ok) {
          return new Response(JSON.stringify({ is_online: false, config }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const metrics = await resp.json();
        return new Response(JSON.stringify({ is_online: true, live_metrics: metrics, config }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (_e) {
        return new Response(JSON.stringify({ is_online: false, config }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ACTION B: Admin Update Secret Key (Server-to-Server Handshake)
    if (action === "admin_update_secret") {
      const isAdmin = user.email === Deno.env.get("ADMIN_EMAIL") || user.email === "robiulontherise@gmail.com";
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { new_secret, server_ip, server_port, twilio_account_sid, twilio_auth_token, twilio_from_number } = body;
      const targetIp = server_ip || serverIp;
      const targetPort = server_port || serverPort;

      // Notify Oracle server directly using the current secret
      if (new_secret && new_secret !== currentSecret) {
        try {
          await fetch(`http://${targetIp}:${targetPort}/admin/update-secret`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-gateway-secret": currentSecret,
            },
            body: JSON.stringify({ new_secret }),
          });
        } catch (syncErr) {
          console.warn("Oracle sync warning:", syncErr);
        }
      }

      // Persist in Supabase Table
      await supabase.from("headless_server_config").upsert({
        id: "MASTER_CONFIG",
        server_ip: targetIp,
        server_port: targetPort,
        api_secret_key: new_secret || currentSecret,
        twilio_account_sid: twilio_account_sid || null,
        twilio_auth_token: twilio_auth_token || null,
        twilio_from_number: twilio_from_number || null,
        updated_at: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true, message: "Secret and settings updated securely via Edge Function" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION C: Client Pair Phone (Generate 8-Digit Code via Server)
    if (action === "pair_phone") {
      const { brand_id, phone } = body;
      if (!brand_id || !phone) {
        return new Response(JSON.stringify({ error: "brand_id and phone required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const res = await fetch(`http://${serverIp}:${serverPort}/pair-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gateway-secret": currentSecret,
        },
        body: JSON.stringify({ brand_id, phone: cleanPhone }),
      });

      const data = await res.json();
      if (data.pairing_code) {
        await supabase.from("whatsapp_gateway_settings").upsert({
          brand_id,
          user_id: user.id,
          phone_number: cleanPhone,
          pairing_code: data.pairing_code,
          is_connected: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: "brand_id" });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
