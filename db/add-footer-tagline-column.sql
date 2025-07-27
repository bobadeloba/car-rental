-- Add footer_tagline column to admin_settings table
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS footer_tagline TEXT;

-- Comment on the column to document its purpose
COMMENT ON COLUMN admin_settings.footer_tagline IS 'Text displayed in the footer describing the company';
