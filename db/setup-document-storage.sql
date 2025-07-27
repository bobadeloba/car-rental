-- Create document_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types(id),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  verification_notes TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default document types if they don't exist
INSERT INTO document_types (name, description, required)
VALUES 
  ('Driver License', 'A valid driver license', true),
  ('Passport', 'A valid passport', false),
  ('ID Card', 'A government-issued ID card', false),
  ('Proof of Address', 'A utility bill or bank statement showing your address', true),
  ('Insurance Certificate', 'Valid vehicle insurance certificate', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for user_documents table
-- Enable RLS on the table
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own documents
CREATE POLICY user_documents_select_policy ON user_documents
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own documents
CREATE POLICY user_documents_insert_policy ON user_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own documents
CREATE POLICY user_documents_update_policy ON user_documents
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own documents
CREATE POLICY user_documents_delete_policy ON user_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create policy for admins to access all documents
CREATE POLICY admin_documents_policy ON user_documents
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
