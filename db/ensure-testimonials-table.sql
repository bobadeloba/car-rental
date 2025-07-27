-- First check if the testimonials table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'testimonials'
    ) THEN
        -- Create the testimonials table if it doesn't exist
        CREATE TABLE public.testimonials (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies
        ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

        -- Policy for users to see their own testimonials
        CREATE POLICY "Users can view their own testimonials" 
            ON public.testimonials 
            FOR SELECT 
            USING (auth.uid() = user_id);

        -- Policy for users to insert their own testimonials
        CREATE POLICY "Users can insert their own testimonials" 
            ON public.testimonials 
            FOR INSERT 
            WITH CHECK (auth.uid() = user_id);

        -- Policy for users to update their own testimonials
        CREATE POLICY "Users can update their own testimonials" 
            ON public.testimonials 
            FOR UPDATE 
            USING (auth.uid() = user_id AND status = 'pending');

        -- Policy for public to view approved testimonials
        CREATE POLICY "Public can view approved testimonials" 
            ON public.testimonials 
            FOR SELECT 
            USING (status = 'approved');

        -- Policy for admins to manage all testimonials
        CREATE POLICY "Admins can manage all testimonials" 
            ON public.testimonials 
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
                )
            );

        RAISE NOTICE 'Created testimonials table with RLS policies';
    ELSE
        RAISE NOTICE 'Testimonials table already exists';
    END IF;
END
$$;

-- Ensure the UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND (role = 'admin' OR role = 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
