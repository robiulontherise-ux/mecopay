-- =======================================================================
-- BUET DMC DREAMERS EDTECH PLATFORM - SUPABASE SQL SCHEMA
-- Target Database: PostgreSQL (Supabase Cloud)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/vhajqegupkzfvlswpeja/sql
-- =======================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    order_index INTEGER DEFAULT 0,
    description TEXT,
    icon_name TEXT DEFAULT 'BookOpen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    thumbnail TEXT,
    telegram_link TEXT,
    is_paid BOOLEAN DEFAULT false,
    price NUMERIC DEFAULT 0,
    exam_url TEXT,
    exam_title TEXT,
    duration_minutes INTEGER DEFAULT 30,
    summary TEXT,
    author TEXT DEFAULT 'BUET DMC Dreamers Team',
    tags TEXT[],
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Orders / Volume Purchases Table (for tracking buy volume CTAs)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    payment_method TEXT DEFAULT 'bkash',
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Exam Submissions / Attempts Table
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL,
    total_marks NUMERIC NOT NULL,
    time_taken_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =======================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Categories: Anyone can read, only Admin can insert/update/delete
CREATE POLICY "Public can view categories" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admin can modify categories" 
ON public.categories FOR ALL USING (
    auth.jwt() ->> 'email' = 'buetdmcdreamers314169254@gmail.com' 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Posts: Anyone can read, only Admin can insert/update/delete
CREATE POLICY "Public can view posts" 
ON public.posts FOR SELECT USING (true);

CREATE POLICY "Admin can modify posts" 
ON public.posts FOR ALL USING (
    auth.jwt() ->> 'email' = 'buetdmcdreamers314169254@gmail.com' 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Profiles: Users can view own profile or Admin can view all
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (
    auth.uid() = id OR auth.jwt() ->> 'email' = 'buetdmcdreamers314169254@gmail.com'
);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Orders: Users can view own orders, Admin can view all
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT USING (
    auth.uid() = user_id OR auth.jwt() ->> 'email' = 'buetdmcdreamers314169254@gmail.com'
);

CREATE POLICY "Users can insert orders" 
ON public.orders FOR INSERT WITH CHECK (true);

-- Exam Attempts: Anyone authenticated can insert, read own
CREATE POLICY "Users can view own exam attempts" 
ON public.exam_attempts FOR SELECT USING (
    auth.uid() = user_id OR auth.jwt() ->> 'email' = 'buetdmcdreamers314169254@gmail.com'
);

CREATE POLICY "Users can insert exam attempts" 
ON public.exam_attempts FOR INSERT WITH CHECK (true);

-- =======================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- =======================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN NEW.email = 'buetdmcdreamers314169254@gmail.com' THEN 'admin' ELSE 'student' END
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    role = CASE WHEN EXCLUDED.email = 'buetdmcdreamers314169254@gmail.com' THEN 'admin' ELSE public.profiles.role END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =======================================================================
-- SEED INITIAL EDTECH CATEGORIES
-- =======================================================================

INSERT INTO public.categories (id, name, slug, order_index, description, icon_name)
VALUES 
  ('cat-buet-eng', 'BUET & Engineering', 'buet-engineering', 1, 'Physics, Higher Math & Chemistry Core Concepts for BUET, RUET, CUET, KUET, IUT & BUTEX.', 'Cpu'),
  ('cat-dmc-med', 'DMC & Medical', 'dmc-medical', 2, 'Biology, Organic Chemistry, GK & English High-Yield Masterclasses for DMC, SSMC, MMC & Dental.', 'Stethoscope'),
  ('cat-varsity-ka', 'Varsity Ka Unit', 'varsity-ka', 3, 'DU, JU, RU, CU, GST Combined Question Bank Solutions & Speed Trick Workshops.', 'GraduationCap'),
  ('cat-model-tests', 'Live Model Tests', 'model-tests', 4, 'Negative Marking enabled real-time entrance examinations with nationwide merit list & analytics.', 'Clock'),
  ('cat-prep-books', 'Volumes & Question Banks', 'volumes-books', 5, 'Official printed & digital volumes: Concept books, formula sheets & 20-year archive solutions.', 'BookOpen'),
  ('cat-guidance', 'Topper Strategy & Tips', 'strategy-tips', 6, 'Direct routines, time management and mistake diaries from BUET 1st and DMC 1st rankers.', 'Sparkles')
ON CONFLICT (id) DO NOTHING;

-- Done!
