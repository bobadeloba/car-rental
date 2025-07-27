-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- new, read, replied, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users with admin role to see all submissions
CREATE POLICY "Admins can see all contact submissions"
  ON contact_submissions
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policy for authenticated users with admin role to insert submissions
CREATE POLICY "Admins can insert contact submissions"
  ON contact_submissions
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policy for authenticated users with admin role to update submissions
CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policy for public to insert submissions
CREATE POLICY "Public can insert contact submissions"
  ON contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on update
CREATE TRIGGER update_contact_submissions_updated_at
BEFORE UPDATE ON contact_submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
