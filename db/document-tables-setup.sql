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

-- Enable Row Level Security
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for document_types
CREATE POLICY "Allow public read access for document_types" 
  ON document_types FOR SELECT 
  USING (true);

-- Create policies for user_documents
-- Users can view their own documents
CREATE POLICY "Users can view their own documents" 
  ON user_documents FOR SELECT 
  USING (auth.uid() = user_id);

-- Only service role can insert documents (handled via API)
CREATE POLICY "Service role can insert documents" 
  ON user_documents FOR INSERT 
  TO service_role
  USING (true);

-- Users can delete their own pending documents
CREATE POLICY "Users can delete their own pending documents" 
  ON user_documents FOR DELETE 
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all documents
CREATE POLICY "Admins can view all documents" 
  ON user_documents FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can update all documents
CREATE POLICY "Admins can update all documents" 
  ON user_documents FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Insert some default document types if they don't exist
INSERT INTO document_types (name, description, required)
VALUES 
  ('Driver''s License', 'Valid driver''s license issued by your country', true),
  ('Passport', 'Valid passport for identification', true),
  ('Proof of Address', 'Utility bill or bank statement showing your current address', true),
  ('Insurance Certificate', 'Personal auto insurance certificate', false)
ON CONFLICT DO NOTHING;
