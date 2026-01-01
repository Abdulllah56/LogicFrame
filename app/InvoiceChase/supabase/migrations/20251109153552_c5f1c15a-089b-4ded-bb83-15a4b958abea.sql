-- Add custom reminder schedule fields to invoices table
ALTER TABLE invoices 
ADD COLUMN reminder_day_1 INTEGER DEFAULT 3,
ADD COLUMN reminder_day_2 INTEGER DEFAULT 7,
ADD COLUMN reminder_day_3 INTEGER DEFAULT 14;