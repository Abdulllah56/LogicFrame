-- Add domain verification tracking for Resend
ALTER TABLE email_settings 
ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false;

-- Update provider column to support more types
ALTER TABLE email_settings 
DROP CONSTRAINT IF EXISTS email_settings_provider_check;

ALTER TABLE email_settings 
ADD CONSTRAINT email_settings_provider_check 
CHECK (provider IN ('gmail', 'outlook', 'yahoo', 'custom'));

COMMENT ON COLUMN email_settings.domain_verified IS 'Whether custom domain is verified in Resend (only applicable for custom domains)';
COMMENT ON COLUMN email_settings.provider IS 'Email provider type: gmail, outlook, yahoo, or custom';