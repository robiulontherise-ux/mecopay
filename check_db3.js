import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fwonuakvherzofqximno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY'
);

async function check() {
  const { data, error } = await supabase.from('sms_events').select('*').limit(1);
  console.log("sms_events row:", data);
  console.log("sms_events error:", error);
}
check();
