const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwonuakvherzofqximno.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY');

async function check() {
  const { data, error } = await supabase.rpc('get_triggers_list');
  console.log("RPC get_triggers_list error:", error);
  
  // Actually, we can just do a select from pg_trigger but via edge function or rpc? We don't have access to pg_trigger via standard supabase-js unless exposed.
}
check();
