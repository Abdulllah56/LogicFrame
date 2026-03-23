-- Invoice Chase Improvements Migration
-- 2024-03-23: Add global defaults and per-invoice automation settings

-- 1. Update email_settings with global defaults
ALTER TABLE public.email_settings 
ADD COLUMN IF NOT EXISTS default_reminder_day_1 INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS default_reminder_day_2 INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS default_reminder_day_3 INTEGER DEFAULT 14,
ADD COLUMN IF NOT EXISTS default_reminder_time TEXT DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS default_reminder_timezone TEXT DEFAULT 'UTC';

-- 2. Update invoices table with per-invoice settings
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS auto_chase BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_time TEXT DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS reminder_timezone TEXT DEFAULT 'UTC';

-- 3. Add comments for clarity
COMMENT ON COLUMN public.email_settings.default_reminder_day_1 IS 'Default days after due date for the first reminder';
COMMENT ON COLUMN public.email_settings.default_reminder_day_2 IS 'Default days after due date for the second reminder';
COMMENT ON COLUMN public.email_settings.default_reminder_day_3 IS 'Default days after due date for the third reminder';
COMMENT ON COLUMN public.email_settings.default_reminder_time IS 'Default time of day to send reminders (24h format, e.g., 09:00)';
COMMENT ON COLUMN public.email_settings.default_reminder_timezone IS 'Default timezone for reminder schedule (UTC, GMT, PST, EST, PKT)';

COMMENT ON COLUMN public.invoices.auto_chase IS 'Whether automated reminders are enabled for this invoice';
COMMENT ON COLUMN public.invoices.reminder_time IS 'Specific time of day to send reminders for this invoice';
COMMENT ON COLUMN public.invoices.reminder_timezone IS 'Specific timezone for this invoice reminder schedule';
