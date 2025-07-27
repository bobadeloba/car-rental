-- Create admin_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name VARCHAR(255) DEFAULT 'Car Rental Platform',
  site_description TEXT DEFAULT 'Premium car rental service offering luxury vehicles',
  contact_email VARCHAR(255) DEFAULT 'contact@example.com',
  contact_phone VARCHAR(50) DEFAULT '+1 (555) 123-4567',
  default_currency VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create index on created_by and updated_by
CREATE INDEX IF NOT EXISTS idx_admin_settings_created_by ON admin_settings(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_settings_updated_by ON admin_settings(updated_by);

-- Add RLS policies
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY admin_settings_select_policy ON admin_settings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Only admins can insert settings
CREATE POLICY admin_settings_insert_policy ON admin_settings
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Only admins can update settings
CREATE POLICY admin_settings_update_policy ON admin_settings
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.jwt() ->> 'role' = 'admin'
    )
  );
