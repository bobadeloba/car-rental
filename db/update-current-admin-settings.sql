-- Update the existing admin_settings record to change from "Yolo Rentals" to more professional data
UPDATE admin_settings 
SET 
  app_name = 'Premium Car Rentals',
  contact_email = 'info@premiumcarrentals.com',
  contact_phone = '+1 (555) 123-4567',
  contact_address = 'Business District, City Center',
  whatsapp_phone = '+1 (555) 123-4567',
  company_description = 'Premium luxury car rental service offering the finest vehicles for all your transportation needs.',
  footer_tagline = 'Your premium car rental experience starts here',
  updated_at = NOW()
WHERE app_name = 'Yolo Rentals';
