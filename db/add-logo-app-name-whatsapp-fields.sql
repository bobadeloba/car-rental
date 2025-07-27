-- Check if columns exist and add them if they don't
DO $$
BEGIN
    -- Check for logo_url column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admin_settings' AND column_name = 'logo_url') THEN
        ALTER TABLE admin_settings ADD COLUMN logo_url TEXT;
    END IF;

    -- Check for app_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admin_settings' AND column_name = 'app_name') THEN
        ALTER TABLE admin_settings ADD COLUMN app_name TEXT DEFAULT 'Car Rental';
    END IF;

    -- Check for whatsapp_phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admin_settings' AND column_name = 'whatsapp_phone') THEN
        ALTER TABLE admin_settings ADD COLUMN whatsapp_phone TEXT;
    END IF;
END $$;

-- Create a function to get the app settings
CREATE OR REPLACE FUNCTION get_app_settings()
RETURNS TABLE (
  id UUID,
  site_name VARCHAR(255),
  site_description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  default_currency VARCHAR(10),
  footer_tagline TEXT,
  logo_url TEXT,
  app_name VARCHAR(255),
  whatsapp_phone VARCHAR(50),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.site_name,
    s.site_description,
    s.contact_email,
    s.contact_phone,
    s.default_currency,
    s.footer_tagline,
    s.logo_url,
    s.app_name,
    s.whatsapp_phone,
    s.created_at,
    s.updated_at
  FROM admin_settings s
  ORDER BY s.updated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_app_settings() TO anon, authenticated;
