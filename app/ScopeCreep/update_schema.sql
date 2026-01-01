-- Run this in your Supabase SQL Editor to update your existing database
-- This adds the missing columns that are preventing data from being saved correctly

ALTER TABLE projects ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL DEFAULT 100;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT '$';

-- Also ensure the requests table has the correct structure if needed
-- (The server handles mapping notes <-> justification, so no schema change needed for that if 'notes' exists)
