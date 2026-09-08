const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = 'https://fwonuakvherzofqximno.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzA5MDEsImV4cCI6MjEwMDQwNjkwMX0.29mIqf8zwUczPXIfIILw6ybJRKJ_l8HUttNU-6s-cL0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: 'ALTER TABLE payment_numbers ADD COLUMN additional_numbers JSONB DEFAULT \'[]\'::jsonb;' });
  console.log("data:", data, "error:", error);
}
run();
