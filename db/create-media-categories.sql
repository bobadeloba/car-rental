-- Create a table for media categories if it doesn't exist
CREATE TABLE IF NOT EXISTS media_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some default categories
INSERT INTO media_categories (name, slug, description)
VALUES 
  ('Banners', 'banners', 'Images used for website banners and hero sections'),
  ('Car Images', 'car-images', 'Images of cars in the fleet'),
  ('Backgrounds', 'backgrounds', 'Background images used throughout the site'),
  ('Icons', 'icons', 'Icon images used throughout the site'),
  ('Logos', 'logos', 'Company and partner logos')
ON CONFLICT (slug) DO NOTHING;

-- Add RLS policies for media_categories
ALTER TABLE media_categories ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage categories
CREATE POLICY "Allow admins to manage media categories"
ON media_categories
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = auth.uid() AND auth.users.role = 'admin'
));

-- Policy for all users to view active categories
CREATE POLICY "Allow all users to view active categories"
ON media_categories
FOR SELECT
TO authenticated
USING (is_active = true);
