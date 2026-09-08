import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing payment_links query...");
  const { data: link, error: linkErr } = await supabase
    .from('payment_links')
    .select('*')
    .limit(1);
    
  if (linkErr) console.error("Link Error:", linkErr.message);
  else console.log("Link Data:", link?.length);
  
  console.log("Testing brands query...");
  const { data: brand, error: brandErr } = await supabase
    .from('brands')
    .select('*')
    .limit(1);
    
  if (brandErr) console.error("Brand Error:", brandErr.message);
  else console.log("Brand Data:", brand?.length);
  
  console.log("Testing payment_numbers query...");
  const { data: gws, error: gwErr } = await supabase
    .from('payment_numbers')
    .select('*')
    .limit(1);
    
  if (gwErr) console.error("GW Error:", gwErr.message);
  else console.log("GW Data:", gws?.length);
}

test();
