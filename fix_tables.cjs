require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://vhajqegupkzfvlswpeja.supabase.co";
// Must use service role to alter tables? Actually we can't alter tables from JS client with anon key. We need the user to run it in Supabase SQL editor.
