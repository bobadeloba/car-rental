-- Add contact form settings columns to admin_settings table
ALTER TABLE admin_settings 
  ADD COLUMN IF NOT EXISTS contact_form_title VARCHAR(255) DEFAULT 'Send us a message',
  ADD COLUMN IF NOT EXISTS contact_form_subtitle TEXT DEFAULT 'Fill out the form below and we''ll get back to you as soon as possible.',
  ADD COLUMN IF NOT EXISTS contact_form_bg_color VARCHAR(50) DEFAULT 'bg-white dark:bg-gray-800',
  ADD COLUMN IF NOT EXISTS contact_form_border_radius VARCHAR(20) DEFAULT 'rounded-lg',
  ADD COLUMN IF NOT EXISTS contact_form_shadow VARCHAR(30) DEFAULT 'shadow-md',
  ADD COLUMN IF NOT EXISTS contact_form_padding VARCHAR(20) DEFAULT 'p-8',
  ADD COLUMN IF NOT EXISTS contact_form_position VARCHAR(20) DEFAULT 'right';
