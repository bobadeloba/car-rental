-- Check if the columns exist and add them if they don't
DO $$
BEGIN
    -- Check if logo_url column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'admin_settings' 
        AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE admin_settings ADD COLUMN logo_url TEXT;
    END IF;

    -- Check if app_name column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'admin_settings' 
        AND column_name = 'app_name'
    ) THEN
        ALTER TABLE admin_settings ADD COLUMN app_name TEXT DEFAULT 'Car Rental';
    END IF;

    -- Check if whatsapp_phone column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'admin_settings' 
        AND column_name = 'whatsapp_phone'
    ) THEN
        ALTER TABLE admin_settings ADD COLUMN whatsapp_phone TEXT;
    END IF;
END
$$;

-- Make sure the admin_settings table has at least one row
INSERT INTO admin_settings (app_name, created_at, updated_at)
SELECT 'Car Rental', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM admin_settings);

-- Grant access to the admin_settings table for anon and authenticated roles
GRANT SELECT ON admin_settings TO anon, authenticated;
