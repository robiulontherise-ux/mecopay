const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://fwonuakvherzofqximno.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY';
const supabase = createClient(supabaseUrl, supabaseServiceKey);
async function check() {
  const { data, error } = await supabase.from('payment_numbers').select('*').limit(1);
  if (data && data.length > 0) {
    console.log(Object.keys(data[0]));
  } else if (data) {
    console.log("No rows, but success.");
  } else {
    console.log("Error:", error);
  }
}
check();
