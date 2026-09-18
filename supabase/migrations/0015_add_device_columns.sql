-- Migration 0015: Add device_name and device_name_2 columns to payment_numbers table
-- Run this in Supabase Dashboard -> SQL Editor

ALTER TABLE payment_numbers ADD COLUMN IF NOT EXISTS device_name TEXT;
ALTER TABLE payment_numbers ADD COLUMN IF NOT EXISTS device_name_2 TEXT;
