ALTER TABLE device_status ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE device_status ADD COLUMN IF NOT EXISTS connected BOOLEAN DEFAULT false;
ALTER TABLE device_status ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE device_status DROP CONSTRAINT IF EXISTS device_status_user_id_device_id_key;
ALTER TABLE device_status ADD CONSTRAINT device_status_user_id_device_id_key UNIQUE (user_id, device_id);

-- Also allow inserts/updates for device_status
DROP POLICY IF EXISTS "Users can manage own device status" ON device_status;
CREATE POLICY "Users can manage own device status" ON device_status FOR ALL USING (auth.uid() = user_id);
