-- Add content columns to admin_settings table if they don't exist
ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS about_content TEXT,
ADD COLUMN IF NOT EXISTS terms_content TEXT,
ADD COLUMN IF NOT EXISTS privacy_content TEXT,
ADD COLUMN IF NOT EXISTS faq_content TEXT,
ADD COLUMN IF NOT EXISTS homepage_hero_title VARCHAR(255) DEFAULT 'Premium Car Rental Service',
ADD COLUMN IF NOT EXISTS homepage_hero_subtitle VARCHAR(255) DEFAULT 'Rent the car of your dreams',
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255) DEFAULT 'contact@example.com',
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50) DEFAULT '+1 (555) 123-4567',
ADD COLUMN IF NOT EXISTS contact_address TEXT DEFAULT '123 Main St, City, Country',
ADD COLUMN IF NOT EXISTS seo_title_template VARCHAR(255) DEFAULT '{page} | Car Rental Service',
ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT 'Premium car rental service offering luxury vehicles';

-- Update existing row or insert if not exists
INSERT INTO admin_settings (
  site_name, 
  site_description, 
  about_content,
  terms_content,
  privacy_content,
  faq_content,
  homepage_hero_title,
  homepage_hero_subtitle,
  contact_email,
  contact_phone,
  contact_address,
  seo_title_template,
  seo_description
)
VALUES (
  'Car Rental Service',
  'Premium car rental service offering luxury vehicles',
  'About us content goes here.',
  'Terms and conditions content goes here.',
  'Privacy policy content goes here.',
  'FAQ content goes here.',
  'Premium Car Rental Service',
  'Rent the car of your dreams',
  'contact@example.com',
  '+1 (555) 123-4567',
  '123 Main St, City, Country',
  '{page} | Car Rental Service',
  'Premium car rental service offering luxury vehicles'
)
ON CONFLICT (id) 
DO UPDATE SET
  about_content = EXCLUDED.about_content,
  terms_content = EXCLUDED.terms_content,
  privacy_content = EXCLUDED.privacy_content,
  faq_content = EXCLUDED.faq_content,
  homepage_hero_title = EXCLUDED.homepage_hero_title,
  homepage_hero_subtitle = EXCLUDED.homepage_hero_subtitle,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  contact_address = EXCLUDED.contact_address,
  seo_title_template = EXCLUDED.seo_title_template,
  seo_description = EXCLUDED.seo_description,
  updated_at = NOW();
