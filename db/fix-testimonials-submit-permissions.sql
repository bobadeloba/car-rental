-- Enable Row Level Security on the testimonials table if not already enabled
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

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
