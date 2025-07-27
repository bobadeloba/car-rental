-- Add a policy to allow public read access to admin_settings
CREATE POLICY admin_settings_public_read
ON admin_settings
FOR SELECT
TO public
USING (true);

-- Make sure the table has RLS enabled
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
