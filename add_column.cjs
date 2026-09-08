const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwonuakvherzofqximno.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY');
async function test() {
  const { error } = await supabase.rpc('execute_sql', { sql_query: "ALTER TABLE fraud_reports ADD COLUMN IF NOT EXISTS attachment_url TEXT;" });
  console.log("Alter table:", error || "success");
}
test();
