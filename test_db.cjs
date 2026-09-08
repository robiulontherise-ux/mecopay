const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: users, error: userErr } = await supabaseAdmin.auth.admin.listUsers();
  if (userErr) return console.error(userErr);
  
  console.log("Users:", users.users.length);
  for (const u of users.users) {
    const { error } = await supabaseAdmin.from('profiles').insert({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || 'Unknown',
      plan_type: 'free',
      hmac_secret: 'sk_test_' + Math.random().toString(36).substr(2, 5)
    });
    console.log('Insert for', u.email, ':', error?.message || 'Success');
  }
}
run();
