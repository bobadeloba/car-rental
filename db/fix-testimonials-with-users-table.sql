-- Step 1: Ensure the testimonials table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'testimonials'
    ) THEN
        -- Create the testimonials table
        CREATE TABLE public.testimonials (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT NOT NULL,
            email TEXT,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT NOT NULL,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        RAISE NOTICE 'Created testimonials table';
    END IF;
END $$;

-- Step 2: Set up RLS for testimonials table
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policy for users to view only approved testimonials
DROP POLICY IF EXISTS "View approved testimonials" ON public.testimonials;
CREATE POLICY "View approved testimonials" 
    ON public.testimonials 
    FOR SELECT 
    USING (status = 'approved');

-- Policy for users to insert their own testimonials
DROP POLICY IF EXISTS "Users can add testimonials" ON public.testimonials;
CREATE POLICY "Users can add testimonials" 
    ON public.testimonials 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy for users to view their own testimonials regardless of status
DROP POLICY IF EXISTS "Users can view their own testimonials" ON public.testimonials;
CREATE POLICY "Users can view their own testimonials" 
    ON public.testimonials 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Step 3: Create a function to check if a user is an admin using the users table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if the users table exists and has a role column
    IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'role'
    ) THEN
        -- If it exists, check if the user is an admin
        SELECT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        ) INTO is_admin;
    ELSE
        -- If users table doesn't have a role column, default to false
        is_admin := FALSE;
    END IF;
    
    RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for admins to manage all testimonials using the function
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" 
    ON public.testimonials 
    FOR ALL
    USING (public.is_admin());

-- Step 4: Create the approved_testimonials view
DROP VIEW IF EXISTS public.approved_testimonials;
CREATE OR REPLACE VIEW public.approved_testimonials AS
SELECT 
    id,
    full_name,
    rating,
    comment,
    created_at
FROM 
    public.testimonials
WHERE 
    status = 'approved';

-- Grant access to the view for all users
GRANT SELECT ON public.approved_testimonials TO anon, authenticated;
