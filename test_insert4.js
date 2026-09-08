import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://fwonuakvherzofqximno.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY');

async function run() {
  const { data, error } = await supabase.from('payment_links').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    brand_id: 1, // Let's see if it's int or uuid
    product_name: 'Test',
    price: 100,
    slug: Math.random().toString(36).substring(2, 10),
    product_image: '',
    redirect_link: ''
  });
  console.log("Error:", error);
}
run();
