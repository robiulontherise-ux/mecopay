ALTER TABLE public.device_status ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'offline';
NOTIFY pgrst, 'reload schema';
