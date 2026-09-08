import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://fwonuakvherzofqximno.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzA5MDEsImV4cCI6MjEwMDQwNjkwMX0.29mIqf8zwUczPXIfIILw6ybJRKJ_l8HUttNU-6s-cL0');

async function run() {
  const { error } = await supabase.from('payment_links').insert({
    brand_id: '4f6bc693-14d2-43bb-9276-857e4cdcc6e5', // some uuid
    product_name: 'Test 2',
    price: 200,
    slug: Math.random().toString(36).substring(2, 10)
  });
  console.log(error);
}
run();
