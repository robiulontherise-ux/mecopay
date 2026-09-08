-- 1. Create a function to automatically insert a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, hmac_secret)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    gen_random_uuid()::text -- Automatically generates a random secret
  );
  RETURN NEW;
END;
$$;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Also, let's insert a profile for any existing users who are missing one!
INSERT INTO public.profiles (id, email, full_name, hmac_secret)
SELECT id, email, raw_user_meta_data->>'full_name', gen_random_uuid()::text
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
