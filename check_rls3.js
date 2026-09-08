import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fwonuakvherzofqximno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzA5MDEsImV4cCI6MjEwMDQwNjkwMX0.29mIqf8zwUczPXIfIILw6ybJRKJ_l8HUttNU-6s-cL0'
);

async function check() {
  const { data, error } = await supabase.from('sms_events').select('*').eq('user_id', '9d0acfb5-833b-4ba5-9d8f-3a3cf8919ce2').eq('status', 'pending');
  console.log("Anon select sms_events:", data);
}
check();
