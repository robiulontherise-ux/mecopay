-- Run this in your Supabase SQL Editor to create the missing tables for Website Builder

-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  site_name TEXT,
  site_logo TEXT,
  site_name_color TEXT,
  site_name_size TEXT,
  primary_color TEXT,
  text_size TEXT,
  show_default_home BOOLEAN DEFAULT false,
  default_home_content TEXT,
  default_home_format_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(client_id)
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  description TEXT,
  icon_name TEXT,
  parent_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  thumbnail TEXT,
  views_count INTEGER DEFAULT 0,
  format_type TEXT DEFAULT 'standard',
  code_language TEXT,
  show_details_btn BOOLEAN DEFAULT true,
  show_share_btn BOOLEAN DEFAULT true,
  show_thumbnail BOOLEAN DEFAULT true,
  show_full_post BOOLEAN DEFAULT false,
  is_custom_page BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Row Level Security (RLS) configuration for standard usage
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow users to manage only their own records based on client_id (user id)
CREATE POLICY "Users can view their own settings" ON site_settings FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert their own settings" ON site_settings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update their own settings" ON site_settings FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete their own settings" ON site_settings FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Users can view their own categories" ON categories FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert their own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update their own categories" ON categories FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete their own categories" ON categories FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Users can view their own posts" ON posts FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (auth.uid() = client_id);

-- Storage bucket permissions (optional public read, authenticated insert)
-- Requires creating bucket "post_img" manually if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('post_img', 'post_img', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'post_img');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post_img');
