-- Check if document_types table exists, if not create it
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if user_documents table exists, if not create it
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  verification_notes TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default document types if they don't exist
INSERT INTO document_types (name, description, required)
VALUES 
  ('Driver''s License', 'A valid driver''s license issued by your country', true),
  ('Passport', 'A valid passport for identification', true),
  ('Proof of Address', 'A utility bill or bank statement showing your current address', true),
  ('Insurance Certificate', 'Proof of personal auto insurance coverage', false),
  ('International Driving Permit', 'Required for international visitors', false)
ON CONFLICT (id) DO NOTHING;
