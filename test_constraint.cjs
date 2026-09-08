const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwonuakvherzofqximno.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzA5MDEsImV4cCI6MjEwMDQwNjkwMX0.29mIqf8zwUczPXIfIILw6ybJRKJ_l8HUttNU-6s-cL0');

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: "SELECT conname FROM pg_constraint WHERE conrelid = 'payment_numbers'::regclass" });
  console.log(error);
}
run();
