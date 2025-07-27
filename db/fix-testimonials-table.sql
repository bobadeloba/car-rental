-- Check if testimonials table exists, if not create it
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS insert_own_testimonials ON testimonials;
DROP POLICY IF EXISTS select_own_testimonials ON testimonials;
DROP POLICY IF EXISTS view_approved_testimonials ON testimonials;
DROP POLICY IF EXISTS view_approved_testimonials_auth ON testimonials;
DROP POLICY IF EXISTS admin_all_access ON testimonials;

-- Create a policy that allows authenticated users to insert their own testimonials
CREATE POLICY insert_own_testimonials ON testimonials
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows authenticated users to select their own testimonials
CREATE POLICY select_own_testimonials ON testimonials
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create a policy that allows anonymous users to view approved testimonials
CREATE POLICY view_approved_testimonials ON testimonials
    FOR SELECT
    TO anon
    USING (status = 'approved');

-- Create a policy that allows authenticated users to view approved testimonials
CREATE POLICY view_approved_testimonials_auth ON testimonials
    FOR SELECT
    TO authenticated
    USING (status = 'approved' OR auth.uid() = user_id);

-- Create a policy that allows service role to do everything
CREATE POLICY service_role_all_access ON testimonials
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT ON testimonials TO authenticated;
GRANT SELECT ON testimonials TO anon;
GRANT ALL ON testimonials TO service_role;
