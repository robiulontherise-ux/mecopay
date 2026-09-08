const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { error } = await supabase.rpc('exec_sql', { sql: "ALTER TABLE invoices ADD COLUMN IF NOT EXISTS funnel_step TEXT DEFAULT 'form_viewed';" });
  console.log("RPC result:", error);
}
run();
