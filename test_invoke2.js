import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://fwonuakvherzofqximno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzA5MDEsImV4cCI6MjEwMDQwNjkwMX0.29mIqf8zwUczPXIfIILw6ybJRKJ_l8HUttNU-6s-cL0'
);
async function check() {
   const { data, error } = await supabase.functions.invoke('verify-payment', { 
      body: { invoiceId: "01173fec-cd2e-4dd6-9ff8-d5b11f62463b", senderNumber: "01973891388", provider: "nagad" } 
   });
   console.log("Response:", data, error);
}
check();
