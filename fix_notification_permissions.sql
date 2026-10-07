-- =========================================================================
-- MecoPay: Notification Channels & WhatsApp Gateway Settings Permissions
-- Run this in Supabase SQL Editor to fix "permission denied" errors
-- =========================================================================

-- 1. Ensure Table whatsapp_gateway_settings Exists with All Required Columns
CREATE TABLE IF NOT EXISTS public.whatsapp_gateway_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID,
    user_id UUID,
    whatsapp_enabled BOOLEAN DEFAULT true,
    email_notification_enabled BOOLEAN DEFAULT true,
    fallback_to_email BOOLEAN DEFAULT true,
    fallback_to_sms BOOLEAN DEFAULT false,
    international_sms_enabled BOOLEAN DEFAULT false,
    international_provider TEXT DEFAULT 'twilio',
    sms_sender_mode TEXT DEFAULT 'device_sim',
    custom_sms_api_url TEXT,
    custom_sms_api_key TEXT,
    sms_api_endpoint TEXT,
    sms_api_key TEXT,
    sms_api_secret TEXT,
    routing_strategy TEXT DEFAULT 'smart_fallback',
    send_all_channels BOOLEAN DEFAULT false,
    auto_courier_advance BOOLEAN DEFAULT true,
    auto_courier_cod BOOLEAN DEFAULT false,
    digital_product_sms_enabled BOOLEAN DEFAULT true,
    selected_device_id TEXT,
    selected_sim_number TEXT,
    phone_number TEXT,
    is_connected BOOLEAN DEFAULT false,
    pairing_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist in case table was created earlier with fewer columns
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS brand_id UUID;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS email_notification_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS fallback_to_email BOOLEAN DEFAULT true;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS fallback_to_sms BOOLEAN DEFAULT false;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS international_sms_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS international_provider TEXT DEFAULT 'twilio';
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS sms_sender_mode TEXT DEFAULT 'device_sim';
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS custom_sms_api_url TEXT;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS custom_sms_api_key TEXT;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS sms_api_endpoint TEXT;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS sms_api_key TEXT;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS sms_api_secret TEXT;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS routing_strategy TEXT DEFAULT 'smart_fallback';
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS send_all_channels BOOLEAN DEFAULT false;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS auto_courier_advance BOOLEAN DEFAULT true;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS auto_courier_cod BOOLEAN DEFAULT false;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS digital_product_sms_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS selected_device_id TEXT;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS selected_sim_number TEXT;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS is_connected BOOLEAN DEFAULT false;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS pairing_code TEXT;
ALTER TABLE public.whatsapp_gateway_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Ensure Unique Constraint on brand_id for ON CONFLICT (brand_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_gateway_settings_brand_id_key'
    ) THEN
        ALTER TABLE public.whatsapp_gateway_settings 
        ADD CONSTRAINT whatsapp_gateway_settings_brand_id_key UNIQUE (brand_id);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Ensure Table notification_templates Exists
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID,
    user_id UUID,
    event_type TEXT,
    channel TEXT,
    template_body TEXT,
    email_subject TEXT,
    email_html_body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist
ALTER TABLE public.notification_templates ADD COLUMN IF NOT EXISTS brand_id UUID;
ALTER TABLE public.notification_templates ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.notification_templates ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE public.notification_templates ADD COLUMN IF NOT EXISTS channel TEXT;
ALTER TABLE public.notification_templates ADD COLUMN IF NOT EXISTS template_body TEXT;
ALTER TABLE public.notification_templates ADD COLUMN IF NOT EXISTS email_subject TEXT;
ALTER TABLE public.notification_templates ADD COLUMN IF NOT EXISTS email_html_body TEXT;
ALTER TABLE public.notification_templates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure Unique Constraint on (brand_id, event_type, channel) for ON CONFLICT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notification_templates_brand_event_channel_key'
    ) THEN
        ALTER TABLE public.notification_templates 
        ADD CONSTRAINT notification_templates_brand_event_channel_key UNIQUE (brand_id, event_type, channel);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 4. GRANT Full Privileges to anon, authenticated, service_role, and postgres
GRANT ALL ON TABLE public.whatsapp_gateway_settings TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.notification_templates TO anon, authenticated, service_role, postgres;

-- 5. Set up RLS Policies (Allow all operations for authenticated and public access)
ALTER TABLE public.whatsapp_gateway_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "whatsapp_gateway_settings_all" ON public.whatsapp_gateway_settings;
CREATE POLICY "whatsapp_gateway_settings_all" ON public.whatsapp_gateway_settings 
FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notification_templates_all" ON public.notification_templates;
CREATE POLICY "notification_templates_all" ON public.notification_templates 
FOR ALL TO public USING (true) WITH CHECK (true);
