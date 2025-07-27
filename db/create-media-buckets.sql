-- Create a new storage bucket for media files
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('media', 'media', true, false)
ON CONFLICT (id) DO NOTHING;

-- Create a policy to allow authenticated users to upload media
CREATE POLICY "Allow authenticated users to upload media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND auth.uid() = owner);

-- Create a policy to allow authenticated users to update their own media
CREATE POLICY "Allow authenticated users to update their own media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND auth.uid() = owner);

-- Create a policy to allow authenticated users to delete their own media
CREATE POLICY "Allow authenticated users to delete their own media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND auth.uid() = owner);

-- Create a policy to allow public read access to media files
CREATE POLICY "Allow public read access to media files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Create a policy to allow admins full access to all media
CREATE POLICY "Allow admins full access to all media"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'media' AND EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = auth.uid() AND auth.users.role = 'admin'
));
