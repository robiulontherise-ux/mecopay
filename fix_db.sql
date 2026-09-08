ALTER TABLE device_status ADD CONSTRAINT device_status_user_id_key UNIQUE (user_id);

ALTER TABLE payment_numbers DROP CONSTRAINT IF EXISTS payment_numbers_brand_id_fkey;
ALTER TABLE payment_numbers ADD CONSTRAINT payment_numbers_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;

ALTER TABLE payment_links DROP CONSTRAINT IF EXISTS payment_links_brand_id_fkey;
ALTER TABLE payment_links ADD CONSTRAINT payment_links_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_brand_id_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
