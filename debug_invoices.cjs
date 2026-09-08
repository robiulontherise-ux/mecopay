const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://fwonuakvherzofqximno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY'
);
async function check() {
  const { data: inv } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(3);
  console.log("Recent Invoices:", inv);
}
check();
