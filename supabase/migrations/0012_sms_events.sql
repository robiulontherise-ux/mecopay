CREATE TABLE IF NOT EXISTS sms_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  invoice_id UUID,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  trx_id_extracted TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: user_id foreign key check might depend on how auth.users or profiles are set up,
-- but a basic RLS is required:
ALTER TABLE sms_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sms_events"
ON sms_events
FOR ALL
USING (auth.uid() = user_id);
