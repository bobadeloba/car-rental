-- First, ensure the UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if profiles table exists and create it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) THEN
        -- Create the profiles table
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip TEXT,
            country TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'customer',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies for profiles
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Users can view their own profile
        CREATE POLICY "Users can view own profile" 
            ON public.profiles 
            FOR SELECT 
            USING (auth.uid() = id);
        
        -- Users can update their own profile
        CREATE POLICY "Users can update own profile" 
            ON public.profiles 
            FOR UPDATE 
            USING (auth.uid() = id);
        
        -- Allow public read access to basic profile info
        CREATE POLICY "Public read access to profiles" 
            ON public.profiles 
            FOR SELECT 
            USING (true);
            
        RAISE NOTICE 'Created profiles table with RLS policies';
    ELSE
        RAISE NOTICE 'Profiles table already exists';
    END IF;
END
$$;

-- Now check if testimonials table exists and create it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'testimonials'
    ) THEN
        -- Create the testimonials table
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

        -- Create a simpler admin policy that doesn't depend on profiles table
        CREATE POLICY "Admins can manage all testimonials" 
            ON public.testimonials 
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.email IN (
                        -- Add admin emails here
                        'admin@example.com',
                        'superadmin@example.com'
                        -- Add more admin emails as needed
                    )
                )
            );

        -- Create a function to update updated_at timestamp
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger to update updated_at on testimonials
        CREATE TRIGGER update_testimonials_updated_at
        BEFORE UPDATE ON public.testimonials
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Created testimonials table with RLS policies';
    ELSE
        RAISE NOTICE 'Testimonials table already exists';
    END IF;
END
$$;

-- Create a function to check if a user is an admin (without relying on profiles table)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.email IN (
            -- Add admin emails here
            'admin@example.com',
            'superadmin@example.com'
            -- Add more admin emails as needed
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
