const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabaseAdmin.from('sms_forwarder_settings').select('device_name, project_url, dashboard_url');
  console.log(data, error);
}
run();
