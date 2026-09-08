-- Run this in your Supabase SQL Editor to fix the "conflict" error

-- 1. First, we drop any unique constraints that might have been accidentally added
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find and drop UNIQUE constraint on brand_id
    FOR constraint_name IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'payment_links'::regclass AND contype = 'u'
    LOOP
        -- Only drop if it's not the primary key constraint or slug constraint
        IF constraint_name NOT LIKE '%pkey%' AND constraint_name NOT LIKE '%slug%' THEN
            EXECUTE 'ALTER TABLE payment_links DROP CONSTRAINT ' || constraint_name;
        END IF;
    END LOOP;
END $$;

-- 2. Make sure slug is unique instead (if not already)
ALTER TABLE payment_links ADD CONSTRAINT payment_links_slug_key UNIQUE (slug);
