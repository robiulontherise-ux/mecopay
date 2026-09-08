import { supabase } from './src/lib/supabase';

async function test() {
  // We can't really do much without auth, but let's try an anon select
  const { data, error } = await supabase.from('payment_links').select('*').limit(1);
  console.log("Select Error:", error);
}

test();
