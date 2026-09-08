import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fwonuakvherzofqximno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzA5MDEsImV4cCI6MjEwMDQwNjkwMX0.29mIqf8zwUczPXIfIILw6ybJRKJ_l8HUttNU-6s-cL0'
);

async function check() {
  const channel = supabase.channel('test').on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'invoices'
  }, payload => {
    console.log("PAYLOAD:", payload);
  }).subscribe((status) => {
    console.log("Status:", status);
  });
  
  setTimeout(()=>process.exit(0), 4000);
}
check();
