ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[{"name": "Name", "type": "text", "required": true}, {"name": "Phone", "type": "tel", "required": true}]'::jsonb;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_data JSONB;
