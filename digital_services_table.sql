-- ============================================================================
-- MECOPAY DIGITAL SERVICES TABLE SCHEMA & PERMISSIONS
-- Run this script in the Supabase SQL Editor:
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.digital_services (
    brand_id TEXT PRIMARY KEY,
    client_id TEXT,
    telegram_active BOOLEAN DEFAULT false,
    telegram_expires_at TIMESTAMPTZ,
    facebook_active BOOLEAN DEFAULT false,
    facebook_expires_at TIMESTAMPTZ,
    fb_bot_country TEXT DEFAULT '',
    drive_active BOOLEAN DEFAULT false,
    drive_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy queries by brand
CREATE INDEX IF NOT EXISTS idx_digital_services_brand_id ON public.digital_services(brand_id);
CREATE INDEX IF NOT EXISTS idx_digital_services_client_id ON public.digital_services(client_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.digital_services ENABLE ROW LEVEL SECURITY;

-- Drop any previous restrictive policies
DROP POLICY IF EXISTS "Allow public and client access for digital_services" ON public.digital_services;
DROP POLICY IF EXISTS "Public access for digital_services" ON public.digital_services;

-- Allow full access to anon, authenticated, and service_role
CREATE POLICY "Allow public and client access for digital_services"
ON public.digital_services
FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- Explicitly Grant Permissions to roles
GRANT ALL ON TABLE public.digital_services TO anon;
GRANT ALL ON TABLE public.digital_services TO authenticated;
GRANT ALL ON TABLE public.digital_services TO service_role;
GRANT ALL ON TABLE public.digital_services TO postgres;
