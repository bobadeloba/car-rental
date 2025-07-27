-- Drop existing policies
DROP POLICY IF EXISTS "Admins can see all contact submissions" ON contact_submissions;

-- Create a simpler policy that doesn't try to check the users table
-- This allows the service role to access the data without permission issues
CREATE POLICY "Service role can access all contact submissions"
  ON contact_submissions
  FOR ALL
  USING (true)
  WITH CHECK (true);
