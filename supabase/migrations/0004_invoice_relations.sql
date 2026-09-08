ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS brand_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sender_number TEXT;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_gateway_used_fkey;
ALTER TABLE invoices ALTER COLUMN gateway_used TYPE TEXT; -- Just store the provider name or number ID, or leave as UUID but we switched to payment_numbers
