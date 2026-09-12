-- 1. Ensure columns exist for new post features
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS format_type TEXT DEFAULT 'standard';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS code_language TEXT;

-- 2. Disable RLS to allow inserts from frontend
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
