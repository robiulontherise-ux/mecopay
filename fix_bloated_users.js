import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fwonuakvherzofqximno.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY';
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  
  for (const user of users) {
    let modified = false;
    const metadata = { ...user.user_metadata };
    
    // Remove large base64 strings
    for (const key of ['nid_front_image', 'nid_back_image', 'birth_image', 'face_image']) {
      if (metadata[key] && metadata[key].length > 1000) {
        metadata[key] = 'removed_due_to_size';
        modified = true;
      }
    }
    
    if (modified) {
      console.log(`Fixing user ${user.email}...`);
      await supabase.auth.admin.updateUserById(user.id, { user_metadata: metadata });
      console.log(`User ${user.email} fixed.`);
    }
  }
  console.log("Done checking all users.");
}
run();
