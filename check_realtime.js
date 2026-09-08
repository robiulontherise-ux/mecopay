import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fwonuakvherzofqximno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzA5MDEsImV4cCI6MjEwMDQwNjkwMX0.29mIqf8zwUczPXIfIILw6ybJRKJ_l8HUttNU-6s-cL0'
);

async function check() {
  const channel = supabase.channel('test-channel')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'invoices' }, payload => {
      console.log('Update received!', payload);
    })
    .subscribe((status) => {
      console.log('Sub status:', status);
    });

  // wait 5 seconds then exit
  setTimeout(() => process.exit(0), 5000);
}
check();
