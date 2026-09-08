require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, hmac_secret')
    .eq('id', '9d0acfb5-833b-4ba5-9d8f-3a3cf8919ce2');
  console.log("Profiles:", data, error);
}
check();
