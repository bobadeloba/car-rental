-- Create policy to allow authenticated users to insert their own submissions
CREATE POLICY "Users can insert their own contact submissions"
ON contact_submissions FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Create policy to allow authenticated users to view their own submissions
CREATE POLICY "Users can view their own contact submissions"
ON contact_submissions FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Create policy to allow service role to access all submissions
CREATE POLICY "Service role can access all contact submissions"
ON contact_submissions
TO service_role
USING (true);

-- Create policy to allow authenticated admin users to access all submissions
CREATE POLICY "Admin users can access all contact submissions"
ON contact_submissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
