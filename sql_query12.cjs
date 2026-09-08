const { createClient } = require('@supabase/supabase-js');
const url = 'https://fwonuakvherzofqximno.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY';
const supabaseAdmin = createClient(url, serviceKey);

async function run() {
  await supabaseAdmin.from('sms_forwarder_settings').delete().eq('device_name', 'test-device-4');
  await supabaseAdmin.from('device_status').delete().eq('device_id', 'test-device-4');
  console.log('test-device-4 deleted');
}
run();
