const { createClient } = require('@supabase/supabase-js');
const url = 'https://fwonuakvherzofqximno.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY';
const supabaseAdmin = createClient(url, serviceKey);

async function run() {
  // We can query pg_policies using RPC if we created one. Since we didn't, we can't.
  // But we can check if RLS is enabled by trying to insert as an anonymous user (no JWT).
  
  const anonSupabase = createClient(url, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzA5MDEsImV4cCI6MjEwMDQwNjkwMX0.29mIqf8zwUczPXIfIILw6ybJRKJ_l8HUttNU-6s-cL0');
  
  const { error } = await anonSupabase.from('sms_forwarder_settings').upsert({
    user_id: '9d0acfb5-833b-4ba5-9d8f-3a3cf8919ce2',
    device_name: 'anon-test'
  });
  console.log("Anon Insert Error:", error);
}
run();
