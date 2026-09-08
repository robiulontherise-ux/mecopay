import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fwonuakvherzofqximno.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY';
const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

async function run() {
  const { data, error } = await supabase.rpc('get_constraints', {});
  if (error) {
    // Fallback: run a direct REST query if possible or just try to insert and see the exact error.
    console.log("RPC Error:", error.message);
  } else {
    console.log(data);
  }
}
run();
