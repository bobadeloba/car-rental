-- Create document_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verification_notes TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default document types if they don't exist
INSERT INTO document_types (name, description, required)
VALUES 
  ('Driver License', 'A valid driver license', true),
  ('Insurance Certificate', 'Proof of insurance coverage', true),
  ('Passport', 'International travel document', false),
  ('ID Card', 'National identification card', false),
  ('Proof of Address', 'Utility bill or bank statement', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for user_documents table

-- Enable RLS on the user_documents table
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own documents
DROP POLICY IF EXISTS "Users can view their own documents" ON user_documents;
CREATE POLICY "Users can view their own documents" 
  ON user_documents 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own documents
DROP POLICY IF EXISTS "Users can insert their own documents" ON user_documents;
CREATE POLICY "Users can insert their own documents" 
  ON user_documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own documents
DROP POLICY IF EXISTS "Users can update their own documents" ON user_documents;
CREATE POLICY "Users can update their own documents" 
  ON user_documents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own documents
DROP POLICY IF EXISTS "Users can delete their own documents" ON user_documents;
CREATE POLICY "Users can delete their own documents" 
  ON user_documents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policy for admins to manage all documents
DROP POLICY IF EXISTS "Admins can manage all documents" ON user_documents;
CREATE POLICY "Admins can manage all documents" 
  ON user_documents 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Set up storage policies for user-documents bucket
-- Note: These need to be run through the Supabase dashboard or API
-- as they can't be executed directly through SQL
