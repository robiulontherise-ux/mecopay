const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://fwonuakvherzofqximno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY'
);
async function check() {
  const { data, error } = await supabase.from('sms_events').select('id, status, invoice_id, message').order('created_at', { ascending: false }).limit(5);
  console.log("Recent SMS Events:", data, error);
  
  const { data: inv, error: iErr } = await supabase.from('invoices').select('id, status, sender_number').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Invoices:", inv, iErr);
}
check();
