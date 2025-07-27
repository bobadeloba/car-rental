-- Function to create media bucket policies
CREATE OR REPLACE FUNCTION public.create_media_bucket_policies()
RETURNS void AS $$
BEGIN
    -- Create a policy to allow authenticated users to upload media
    BEGIN
        CREATE POLICY "Allow authenticated users to upload media"
        ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'media' AND auth.uid() = owner);
    EXCEPTION 
        WHEN duplicate_object THEN 
            NULL;
    END;

    -- Create a policy to allow authenticated users to update their own media
    BEGIN
        CREATE POLICY "Allow authenticated users to update their own media"
        ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (bucket_id = 'media' AND auth.uid() = owner);
    EXCEPTION 
        WHEN duplicate_object THEN 
            NULL;
    END;

    -- Create a policy to allow authenticated users to delete their own media
    BEGIN
        CREATE POLICY "Allow authenticated users to delete their own media"
        ON storage.objects
        FOR DELETE
        TO authenticated
        USING (bucket_id = 'media' AND auth.uid() = owner);
    EXCEPTION 
        WHEN duplicate_object THEN 
            NULL;
    END;

    -- Create a policy to allow public read access to media files
    BEGIN
        CREATE POLICY "Allow public read access to media files"
        ON storage.objects
        FOR SELECT
        TO public
        USING (bucket_id = 'media');
    EXCEPTION 
        WHEN duplicate_object THEN 
            NULL;
    END;

    -- Create a policy to allow admins full access to all media
    BEGIN
        CREATE POLICY "Allow admins full access to all media"
        ON storage.objects
        FOR ALL
        TO authenticated
        USING (bucket_id = 'media' AND EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid() AND auth.users.role = 'admin'
        ));
    EXCEPTION 
        WHEN duplicate_object THEN 
            NULL;
    END;
END;
$$ LANGUAGE plpgsql;
