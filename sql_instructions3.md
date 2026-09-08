-- Run this in SQL Editor to create tables for Heartbeat and SMS Webhooks

CREATE TABLE IF NOT EXISTS public.device_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT,
    connected BOOLEAN DEFAULT false,
    last_heartbeat_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.sms_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender TEXT,
    message TEXT,
    raw_payload JSONB,
    status TEXT DEFAULT 'pending', -- 'pending', 'matched'
    invoice_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.device_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage own device status" ON public.device_status FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own sms events" ON public.sms_events FOR ALL USING (auth.uid() = user_id);
