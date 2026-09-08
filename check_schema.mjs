import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if(!supabaseUrl) {
    const env = fs.readFileSync('.env.local', 'utf8');
    const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    if(urlMatch) supabaseUrl = urlMatch[1];
    if(keyMatch) supabaseKey = keyMatch[1];
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function run() {
  const { data, error } = await supabase.from('payment_links').select('*').limit(1);
  console.log(error || (data.length ? data[0] : 'empty'));
}
run();
