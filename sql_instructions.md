# Database Schema Updates

Run this in the SQL Editor to add the necessary columns:

```sql
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS telegram_url TEXT,
ADD COLUMN IF NOT EXISTS tally_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT,
ADD COLUMN IF NOT EXISTS drive_url TEXT,
ADD COLUMN IF NOT EXISTS verify_trx_id BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS verify_phone BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS merchant_api BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS personal_api BOOLEAN DEFAULT false;
```
