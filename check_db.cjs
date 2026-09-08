const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://fwonuakvherzofqximno.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY'
);

async function check() {
  const { data: cols, error: colErr } = await supabase.rpc('hello').select('*').limit(1).catch(()=>({}));
  // let's just fetch 1 row from sms_events
  const { data, error } = await supabase.from('sms_events').select('*').limit(1);
  console.log("Row:", data);
  
  // check publications
  const { data: pub, error: pubErr } = await supabase.from('pg_publication_tables').select('*').eq('pubname', 'supabase_realtime').catch(()=>({error: 'cant access pg_publication_tables'}));
  console.log("Realtime tables:", pub || pubErr);
}
check();
