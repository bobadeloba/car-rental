-- Create a storage bucket for logos if it doesn't exist
DO $$
BEGIN
  -- Check if the bucket exists
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'logos'
  ) THEN
    -- Create the bucket
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('logos', 'logos', true);
    
    -- Create policy to allow authenticated users to upload
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Authenticated users can upload logos',
      '(role() = ''authenticated''::text)',
      'logos'
    );
  END IF;
END $$;
