-- Create content table for storing different types of content
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a unique constraint on type and language
CREATE UNIQUE INDEX IF NOT EXISTS content_type_language_idx ON content (type, language);

-- Insert default content if not exists
INSERT INTO content (type, title, content, language)
VALUES 
  ('about', 'About Us', 'About us content goes here.', 'en'),
  ('terms', 'Terms and Conditions', 'Terms and conditions content goes here.', 'en'),
  ('privacy', 'Privacy Policy', 'Privacy policy content goes here.', 'en'),
  ('faq', 'Frequently Asked Questions', 'FAQ content goes here.', 'en'),
  ('cookie', 'Cookie Policy', 'Cookie policy content goes here.', 'en')
ON CONFLICT (type, language) DO NOTHING;
