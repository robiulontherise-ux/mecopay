const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_statement: `
      CREATE TABLE IF NOT EXISTS public.fraud_reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        payment_link_id UUID REFERENCES public.payment_links(id) ON DELETE SET NULL,
        invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'Open',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;
      
      -- Let admins see everything, clients see their own reports (as merchant)
      -- For public users (the actual payer submitting it), we might just allow insert.
      
      CREATE POLICY "Allow public insert to fraud_reports"
      ON public.fraud_reports FOR INSERT TO public
      WITH CHECK (true);
      
      CREATE POLICY "Allow users to read their own fraud_reports"
      ON public.fraud_reports FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
    `
  });
  console.log(error || data);
}
createTable();
