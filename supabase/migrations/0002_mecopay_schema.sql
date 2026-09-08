-- Create Brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  support_email TEXT,
  support_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own brands" ON brands FOR ALL USING (auth.uid() = user_id);

-- Create Payment Numbers (Gateway Settings)
CREATE TABLE IF NOT EXISTS payment_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  brand_id UUID REFERENCES brands(id) NOT NULL,
  provider TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'personal',
  number TEXT NOT NULL,
  monthly_volume NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own payment numbers" ON payment_numbers FOR ALL USING (auth.uid() = user_id);

-- Create Payment Links
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  brand_id UUID REFERENCES brands(id) NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price NUMERIC NOT NULL,
  redirect_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own payment links" ON payment_links FOR ALL USING (auth.uid() = user_id);
