-- 1. Ensure all columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hmac_secret TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student', 'merchant'));

-- 2. Make hmac_secret NOT NULL with a default if it was missing
UPDATE public.profiles SET hmac_secret = gen_random_uuid()::text WHERE hmac_secret IS NULL;

-- 3. Restore the correct trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, hmac_secret)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'student',
    gen_random_uuid()::text
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Backfill missing profiles
INSERT INTO public.profiles (id, email, full_name, hmac_secret, role)
SELECT id, email, raw_user_meta_data->>'full_name', gen_random_uuid()::text, 'student'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
