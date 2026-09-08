require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://vhajqegupkzfvlswpeja.supabase.co";
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoYWpxZWd1cGt6ZnZsc3dwZWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTQ3NDIsImV4cCI6MjEwMzE3MDc0Mn0.5bD2xPSkDJ3h9-HZd5aRdpyxCxIXynMcGsivE1nQZSk"; // using anon key if service not available
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function check() {
  const { data: settings, error: sErr } = await supabase.from('site_settings').select('*');
  console.log("All Settings:", settings, sErr);
  
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(5);
  console.log("Profiles:", profiles, pErr);
}
check();
