import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if(!supabaseUrl) {
    // try reading .env
    const fs = require('fs');
    const env = fs.readFileSync('.env.local', 'utf8');
    const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    if(urlMatch) process.env.VITE_SUPABASE_URL = urlMatch[1];
    if(keyMatch) process.env.VITE_SUPABASE_ANON_KEY = keyMatch[1];
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });

async function run() {
  const { data, error } = await supabase.from('payment_numbers').select('*').limit(1);
  console.log("payment_numbers:", data ? "exists" : error);
  const { data: d2, error: e2 } = await supabase.from('payment_links').select('*').limit(1);
  console.log("payment_links:", d2 ? "exists" : e2);
}
run();
