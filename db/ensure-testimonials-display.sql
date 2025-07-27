-- Check if testimonials table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testimonials') THEN
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
    END IF;
END
$$;

-- Ensure RLS is enabled
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users to view approved testimonials
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'testimonials' 
        AND policyname = 'Allow anonymous to view approved testimonials'
    ) THEN
        CREATE POLICY "Allow anonymous to view approved testimonials" 
        ON public.testimonials
        FOR SELECT 
        TO anon
        USING (status = 'approved');
    END IF;
END
$$;

-- Create policy for authenticated users to view approved testimonials
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'testimonials' 
        AND policyname = 'Allow authenticated to view approved testimonials'
    ) THEN
        CREATE POLICY "Allow authenticated to view approved testimonials" 
        ON public.testimonials
        FOR SELECT 
        TO authenticated
        USING (status = 'approved');
    END IF;
END
$$;

-- Create policy for authenticated users to manage their own testimonials
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'testimonials' 
        AND policyname = 'Allow users to manage their own testimonials'
    ) THEN
        CREATE POLICY "Allow users to manage their own testimonials" 
        ON public.testimonials
        FOR ALL 
        TO authenticated
        USING (user_id = auth.uid());
    END IF;
END
$$;

-- Create or replace the function to get approved testimonials
CREATE OR REPLACE FUNCTION get_approved_testimonials(limit_count integer DEFAULT 6)
RETURNS SETOF testimonials AS $$
BEGIN
  RETURN QUERY
  SELECT id, user_id, full_name, email, rating, comment, status, created_at, updated_at
  FROM testimonials
  WHERE status = 'approved'
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION get_approved_testimonials(integer) TO anon, authenticated;

-- Insert sample testimonials if none exist
INSERT INTO public.testimonials (user_id, full_name, email, rating, comment, status)
SELECT 
    auth.uid(),
    'John Smith',
    'john@example.com',
    5,
    'Exceptional service and beautiful cars. The delivery was on time and the car was in perfect condition.',
    'approved'
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE status = 'approved' LIMIT 1)
AND auth.uid() IS NOT NULL
LIMIT 1;

INSERT INTO public.testimonials (user_id, full_name, email, rating, comment, status)
SELECT 
    auth.uid(),
    'Sarah Johnson',
    'sarah@example.com',
    5,
    'I rented a luxury car for my anniversary and it made our day special. The staff was very professional and helpful.',
    'approved'
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE status = 'approved' LIMIT 1)
AND auth.uid() IS NOT NULL
LIMIT 1;

INSERT INTO public.testimonials (user_id, full_name, email, rating, comment, status)
SELECT 
    auth.uid(),
    'Michael Brown',
    'michael@example.com',
    4,
    'Great experience overall. The car was clean and well-maintained. Will definitely use this service again.',
    'approved'
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE status = 'approved' LIMIT 1)
AND auth.uid() IS NOT NULL
LIMIT 1;
