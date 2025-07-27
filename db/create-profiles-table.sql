-- Check if the profiles table exists
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

        -- Create policy to allow admins to read all profiles
        CREATE POLICY "Admins can read all profiles"
            ON public.profiles
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );

        -- Create policy to allow admins to update all profiles
        CREATE POLICY "Admins can update all profiles"
            ON public.profiles
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );

        -- Create policy to allow admins to insert profiles
        CREATE POLICY "Admins can insert profiles"
            ON public.profiles
            FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );

        -- Create policy to allow service role to manage all profiles
        CREATE POLICY "Service role can manage all profiles"
            ON public.profiles
            USING (true)
            WITH CHECK (true);

        -- Create trigger to update updated_at column
        CREATE OR REPLACE FUNCTION update_profiles_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_profiles_updated_at();

        -- Insert a default admin user if auth.users has any records
        INSERT INTO public.profiles (id, email, role)
        SELECT id, email, 'admin'
        FROM auth.users
        LIMIT 1;

        RAISE NOTICE 'Created profiles table with default admin user';
    END IF;
END $$;

-- Add indexes for better performance
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
    ) AND NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND indexname = 'profiles_email_idx'
    ) THEN
        CREATE INDEX profiles_email_idx ON public.profiles(email);
        CREATE INDEX profiles_role_idx ON public.profiles(role);
    END IF;
END $$;
