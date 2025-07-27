-- Check what data is currently in the admin_settings table
SELECT 
  id,
  site_name,
  app_name,
  site_description,
  contact_email,
  contact_phone,
  site_address_line1,
  site_address_line2,
  site_address_city,
  site_address_state,
  site_address_country,
  site_address_postal,
  footer_tagline,
  created_at,
  updated_at
FROM admin_settings 
ORDER BY updated_at DESC 
LIMIT 5;
