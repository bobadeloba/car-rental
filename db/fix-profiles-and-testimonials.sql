-- Step 1: Create the profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
    ) THEN
        -- Create the profiles table
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            first_name TEXT,
            last_name TEXT,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Create policy to allow users to read their own profile
        CREATE POLICY "Users can read their own profile"
            ON public.profiles
            FOR SELECT
            USING (auth.uid() = id);

        -- Create policy to allow users to update their own profile
        CREATE POLICY "Users can update their own profile"
            ON public.profiles
            FOR UPDATE
            USING (auth.uid() = id);

        -- Create policy to allow service role to manage all profiles
        CREATE POLICY "Service role can manage all profiles"
            ON public.profiles
            USING (true)
            WITH CHECK (true);

        -- Insert a default admin user if auth.users has any records
        INSERT INTO public.profiles (id, email, role)
        SELECT id, email, 'admin'
        FROM auth.users
        LIMIT 1;

        RAISE NOTICE 'Created profiles table with default admin user';
    END IF;
END $$;

-- Step 2: Ensure the testimonials table exists
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

-- Step 3: Set up RLS for testimonials table
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

-- Step 4: Create a safer admin policy that doesn't depend on profiles table
-- First, create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if the profiles table exists
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
    ) THEN
        -- If it exists, check if the user is an admin
        SELECT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'superadmin')
        ) INTO is_admin;
    ELSE
        -- If profiles table doesn't exist, default to false
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

-- Step 5: Create the approved_testimonials view
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
