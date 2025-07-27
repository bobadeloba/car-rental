-- Add policies for the profile_pictures bucket if they don't exist yet

-- Allow public read access to profile pictures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Public Access to Profile Pictures' AND bucket_id = 'profile_pictures'
  ) THEN
    CREATE POLICY "Public Access to Profile Pictures"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'profile_pictures');
  END IF;
END
$$;

-- Allow authenticated users to upload their own profile pictures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Users Can Upload Their Own Profile Pictures' AND bucket_id = 'profile_pictures'
  ) THEN
    CREATE POLICY "Users Can Upload Their Own Profile Pictures"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'profile_pictures' AND
      (storage.foldername(name))[1] = auth.uid()
    );
  END IF;
END
$$;

-- Allow users to update their own profile pictures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Users Can Update Their Own Profile Pictures' AND bucket_id = 'profile_pictures'
  ) THEN
    CREATE POLICY "Users Can Update Their Own Profile Pictures"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'profile_pictures' AND
      (storage.foldername(name))[1] = auth.uid()
    );
  END IF;
END
$$;

-- Allow users to delete their own profile pictures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Users Can Delete Their Own Profile Pictures' AND bucket_id = 'profile_pictures'
  ) THEN
    CREATE POLICY "Users Can Delete Their Own Profile Pictures"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'profile_pictures' AND
      (storage.foldername(name))[1] = auth.uid()
    );
  END IF;
END
$$;
