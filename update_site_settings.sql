ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS app_type TEXT DEFAULT 'no_code' CHECK (app_type IN ('no_code', 'custom_zip'));
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS zip_url TEXT;
