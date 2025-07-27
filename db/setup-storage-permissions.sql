-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create storage.buckets table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.buckets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  public BOOLEAN DEFAULT FALSE
);

-- Create storage.objects table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bucket_id TEXT REFERENCES storage.buckets(id),
  name TEXT NOT NULL,
  owner UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  path_tokens TEXT[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED
);

-- Create user-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own objects
CREATE POLICY select_own_objects ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-documents' AND 
    (owner = auth.uid() OR path_tokens[1]::UUID = auth.uid())
  );

-- Create policy to allow users to insert their own objects
CREATE POLICY insert_own_objects ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-documents' AND 
    owner = auth.uid() AND
    path_tokens[1]::UUID = auth.uid()
  );

-- Create policy to allow users to update their own objects
CREATE POLICY update_own_objects ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-documents' AND 
    owner = auth.uid() AND
    path_tokens[1]::UUID = auth.uid()
  );

-- Create policy to allow users to delete their own objects
CREATE POLICY delete_own_objects ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-documents' AND 
    owner = auth.uid() AND
    path_tokens[1]::UUID = auth.uid()
  );

-- Create policy for admins to access all objects
CREATE POLICY admin_all_objects ON storage.objects
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
