ALTER TABLE invoices ADD CONSTRAINT invoices_payment_link_id_fkey FOREIGN KEY (payment_link_id) REFERENCES payment_links(id) ON DELETE SET NULL;
