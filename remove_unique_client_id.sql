-- Run this in your Supabase SQL Editor to allow multiple websites per user
ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_client_id_key;
