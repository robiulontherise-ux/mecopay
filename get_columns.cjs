const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwonuakvherzofqximno.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY');
async function test() {
  const { data: inv } = await supabase.from('invoices').select('*').limit(1);
  console.log("Invoices keys:", inv.length ? Object.keys(inv[0]) : "no data");
  
  const { data: sms } = await supabase.from('sms_events').select('*').limit(1);
  console.log("SMS Events keys:", sms.length ? Object.keys(sms[0]) : "no data");
}
test();
