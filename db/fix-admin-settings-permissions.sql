-- Grant access to admin_settings table for authenticated users
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS admin_settings_select_policy ON admin_settings;
DROP POLICY IF EXISTS admin_settings_insert_policy ON admin_settings;
DROP POLICY IF EXISTS admin_settings_update_policy ON admin_settings;
DROP POLICY IF EXISTS admin_settings_delete_policy ON admin_settings;

-- Create simpler policies that don't reference the users table
CREATE POLICY admin_settings_select_policy ON admin_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY admin_settings_insert_policy ON admin_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY admin_settings_update_policy ON admin_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Make sure foreign key references are properly set up
ALTER TABLE admin_settings 
  DROP CONSTRAINT IF EXISTS admin_settings_created_by_fkey,
  DROP CONSTRAINT IF EXISTS admin_settings_updated_by_fkey;

-- Make created_by and updated_by nullable to avoid foreign key issues
ALTER TABLE admin_settings 
  ALTER COLUMN created_by DROP NOT NULL,
  ALTER COLUMN updated_by DROP NOT NULL;
