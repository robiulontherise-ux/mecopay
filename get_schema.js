const { createClient } = require('@supabase/supabase-js');
const url = 'https://fwonuakvherzofqximno.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY';
const supabase = createClient(url, serviceKey);

async function check() {
  const { data, error } = await supabase.rpc('get_schema_info', {});
  console.log(data, error);
}
// since rpc might not exist, let's just do a dummy insert to see the error
async function testInsert() {
  const { data, error } = await supabase.from('sms_forwarder_settings').upsert({
    user_id: 'test-user-id',
    device_name: 'test-device'
  }, { onConflict: 'user_id,device_name' });
  console.log('Upsert Error:', error);
}
testInsert();
