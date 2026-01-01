-- Remove the global unique constraint on invoice_number
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_key;

-- Add a composite unique constraint for user_id and invoice_number
-- This allows each user to have their own INV-001, INV-002, etc.
ALTER TABLE invoices ADD CONSTRAINT invoices_user_id_invoice_number_key UNIQUE (user_id, invoice_number);