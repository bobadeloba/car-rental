-- Drop the table if it exists
DROP TABLE IF EXISTS contact_submissions;

-- Create the table with the correct structure
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for admins to see all submissions
CREATE POLICY "Admins can see all contact submissions"
  ON contact_submissions
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users 
      WHERE auth.uid() IN (
        SELECT user_id FROM users 
        WHERE role = 'admin'
      )
    )
  );

-- Policy for inserting submissions (anyone can submit)
CREATE POLICY "Anyone can insert contact submissions"
  ON contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Insert a test submission
INSERT INTO contact_submissions (name, email, phone, subject, message, status)
VALUES ('Test User', 'test@example.com', '123-456-7890', 'Test Subject', 'This is a test message', 'new');
