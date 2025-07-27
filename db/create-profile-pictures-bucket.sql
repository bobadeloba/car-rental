-- Create a new storage bucket specifically for profile pictures
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES (
  'profile_pictures',
  'profile_pictures',
  true,
  false
)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the profile pictures bucket
-- Allow public read access to profile pictures
CREATE POLICY "Public Access to Profile Pictures"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile_pictures');

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users Can Upload Their Own Profile Pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile_pictures' AND
  (storage.foldername(name))[1] = auth.uid()
);

-- Allow users to update their own profile pictures
CREATE POLICY "Users Can Update Their Own Profile Pictures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile_pictures' AND
  (storage.foldername(name))[1] = auth.uid()
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users Can Delete Their Own Profile Pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile_pictures' AND
  (storage.foldername(name))[1] = auth.uid()
);
