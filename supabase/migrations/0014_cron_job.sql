-- Note: pg_cron extension needs to be enabled in Supabase Dashboard (Database -> Extensions) before running this.
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job that runs every 1 minute to mark devices offline
SELECT cron.schedule(
  'mark_devices_offline_job', -- Job name
  '* * * * *',                -- Run every minute
  $$
    UPDATE device_status 
    SET connected = false 
    WHERE last_heartbeat_at < NOW() - INTERVAL '90 seconds'
      AND connected = true;
  $$
);
