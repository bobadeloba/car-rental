-- Create document_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  required BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type_id UUID REFERENCES document_types(id),
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default document types if they don't exist
INSERT INTO document_types (name, required, description)
VALUES 
('Driver License', true, 'A valid driver license issued by your country'),
('Passport', false, 'A valid passport for international identification'),
('National ID', false, 'A government-issued national identification card'),
('Proof of Address', true, 'A utility bill or bank statement showing your current address'),
('Insurance Certificate', false, 'Vehicle insurance certificate if you have one')
ON CONFLICT DO NOTHING;

-- Create RLS policies for user_documents
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own documents
DROP POLICY IF EXISTS user_documents_select_policy ON user_documents;
CREATE POLICY user_documents_select_policy ON user_documents
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own documents
DROP POLICY IF EXISTS user_documents_insert_policy ON user_documents;
CREATE POLICY user_documents_insert_policy ON user_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own documents
DROP POLICY IF EXISTS user_documents_update_policy ON user_documents;
CREATE POLICY user_documents_update_policy ON user_documents
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own documents
DROP POLICY IF EXISTS user_documents_delete_policy ON user_documents;
CREATE POLICY user_documents_delete_policy ON user_documents
  FOR DELETE USING (auth.uid() = user_id);
