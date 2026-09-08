CREATE OR REPLACE FUNCTION check_device_online(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_online BOOLEAN;
BEGIN
  -- 1. Auto-cleanup: Set connected = false for any device that hasn't sent a heartbeat in the last 90 seconds
  UPDATE device_status 
  SET connected = false 
  WHERE user_id = p_user_id 
    AND last_heartbeat_at < NOW() - INTERVAL '90 seconds'
    AND connected = true;

  -- 2. Check if ANY device for this user is currently online
  SELECT EXISTS (
    SELECT 1 
    FROM device_status 
    WHERE user_id = p_user_id 
      AND last_heartbeat_at >= NOW() - INTERVAL '90 seconds'
      AND connected = true
  ) INTO is_online;
  
  RETURN is_online;
END;
$$;
