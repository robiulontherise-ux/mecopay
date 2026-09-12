import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vhajqegupkzfvlswpeja.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoYWpxZWd1cGt6ZnZsc3dwZWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTQ3NDIsImV4cCI6MjEwMzE3MDc0Mn0.5bD2xPSkDJ3h9-HZd5aRdpyxCxIXynMcGsivE1nQZSk";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testInsert() {
  console.log('Testing insert...');
  const { data, error } = await supabase.from('posts').insert([
    {
      id: 'test-post-1',
      title: 'Test Post',
      slug: 'test-post',
      content: 'This is a test post',
      category_id: 'cat-buet-eng',
      thumbnail: 'https://example.com/image.jpg',
      created_at: new Date().toISOString()
    }
  ]);
  
  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Insert Success!');
  }
}

testInsert();
