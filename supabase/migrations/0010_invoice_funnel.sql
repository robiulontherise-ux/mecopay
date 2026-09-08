ALTER TABLE invoices ADD COLUMN IF NOT EXISTS funnel_step TEXT DEFAULT 'form_viewed';
