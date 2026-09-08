-- Fix Table Permissions
GRANT ALL ON TABLE public.brands TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.payment_numbers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.payment_links TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.invoices TO anon, authenticated, service_role;

-- Update invoices table to hold reference to link and brand
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS brand_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sender_number TEXT;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_gateway_used_fkey;
ALTER TABLE invoices ALTER COLUMN gateway_used TYPE TEXT;
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS payment_note TEXT;

-- Update RLS for invoices so customers can submit them without being logged in!
DROP POLICY IF EXISTS "Users can manage own invoices" ON invoices;
CREATE POLICY "Merchants can manage own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert invoices" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own invoice" ON invoices FOR UPDATE USING (true);

-- Ensure merchants can insert payment links properly
DROP POLICY IF EXISTS "Users can manage own payment links" ON payment_links;
CREATE POLICY "Users can manage own payment links" ON payment_links FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
