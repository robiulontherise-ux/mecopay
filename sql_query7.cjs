const { createClient } = require('@supabase/supabase-js');
const url = 'https://fwonuakvherzofqximno.supabase.co';
const anonSupabase = createClient(url, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzA5MDEsImV4cCI6MjEwMDQwNjkwMX0.29mIqf8zwUczPXIfIILw6ybJRKJ_l8HUttNU-6s-cL0');

async function run() {
  const { error } = await anonSupabase.from('device_status').upsert({
    user_id: '9d0acfb5-833b-4ba5-9d8f-3a3cf8919ce2',
    device_id: 'anon-ds-test',
    connected: false
  }, { onConflict: 'user_id,device_id' });
  console.log("Device Status Anon Insert Error:", error);
}
run();
