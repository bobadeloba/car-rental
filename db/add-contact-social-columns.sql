-- Add address columns if they don't exist
ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS site_address_line1 VARCHAR(255),
ADD COLUMN IF NOT EXISTS site_address_line2 VARCHAR(255),
ADD COLUMN IF NOT EXISTS site_address_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS site_address_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS site_address_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS site_address_postal VARCHAR(20);

-- Add social media columns if they don't exist
ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS social_facebook VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_twitter VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_instagram VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_youtube VARCHAR(255);
