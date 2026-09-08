const { createClient } = require('@supabase/supabase-js');
const url = 'https://fwonuakvherzofqximno.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY';
const supabase = createClient(url, serviceKey);

async function check() {
  const { data: sfData, error: sfErr } = await supabase.from('sms_forwarder_settings').select('*');
  console.log('sms_forwarder_settings:', sfData ? sfData.length : sfErr);
  
  // Actually, we can check RLS by inserting as an anon user or authenticated user.
  // Better yet, just use the SQL query tool to look at pg_policies.
}
check();
