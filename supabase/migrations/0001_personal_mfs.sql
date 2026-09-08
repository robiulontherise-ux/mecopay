-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  hmac_secret TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Device Status Table (Heartbeat)
CREATE TABLE device_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline',
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE device_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own device status" ON device_status FOR SELECT USING (auth.uid() = user_id);

-- 3. SMS Logs Table
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  sender TEXT NOT NULL,
  message_body TEXT NOT NULL,
  received_stamp TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processed, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sms logs" ON sms_logs FOR SELECT USING (auth.uid() = user_id);

-- 4. Personal MFS Gateways
CREATE TABLE personal_mfs_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  provider TEXT NOT NULL, -- bkash, nagad, rocket
  phone_number TEXT NOT NULL,
  fee_type TEXT DEFAULT 'free', 
  monthly_volume_tk NUMERIC DEFAULT 0,
  max_limit_tk NUMERIC DEFAULT 300000,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE personal_mfs_gateways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own gateways" ON personal_mfs_gateways FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own gateways" ON personal_mfs_gateways FOR ALL USING (auth.uid() = user_id);

-- 5. Invoices / Payments
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  amount NUMERIC NOT NULL,
  gateway_used UUID REFERENCES personal_mfs_gateways(id),
  trx_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);