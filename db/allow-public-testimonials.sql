-- Modify testimonials table to allow null user_id
ALTER TABLE testimonials ALTER COLUMN user_id DROP NOT NULL;

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS insert_own_testimonials ON testimonials;
DROP POLICY IF EXISTS select_own_testimonials ON testimonials;
DROP POLICY IF EXISTS view_approved_testimonials ON testimonials;
DROP POLICY IF EXISTS view_approved_testimonials_auth ON testimonials;
DROP POLICY IF EXISTS admin_all_access ON testimonials;
DROP POLICY IF EXISTS service_role_all_access ON testimonials;
DROP POLICY IF EXISTS public_insert_testimonials ON testimonials;

-- Create a policy that allows public testimonial submissions
CREATE POLICY public_insert_testimonials ON testimonials
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Create a policy that allows authenticated users to select their own testimonials
CREATE POLICY select_own_testimonials ON testimonials
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

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

-- Grant necessary permissions
GRANT SELECT, INSERT ON testimonials TO authenticated;
GRANT SELECT ON testimonials TO anon;
GRANT ALL ON testimonials TO service_role;
