const { createClient } = require('@supabase/supabase-js');
const url = 'https://fwonuakvherzofqximno.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY';
const supabaseAdmin = createClient(url, serviceKey);

async function run() {
  const { error } = await supabaseAdmin.from('sms_forwarder_settings').upsert({
    user_id: '9d0acfb5-833b-4ba5-9d8f-3a3cf8919ce2', // My test user id
    device_name: 'test-device-1',
    hmac_secret: 'some-hmac',
    sender_number: '1234',
    text_filter: 'abcd',
    webhook_edge_url: 'http',
    headers: '{}',
    project_url: 'proj',
    anon_key: 'anon',
    ws_channel: 'ch',
    heartbeat_edge_url: 'hb',
    webhook_url: 'wh',
    heartbeat_ws_url: 'hb_ws',
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,device_name' });
  console.log("Error:", error);
}
run();
