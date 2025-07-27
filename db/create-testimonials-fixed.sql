-- Create the testimonials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.testimonials (
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

-- Enable row level security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create a public view of approved testimonials
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

-- Create policies for the testimonials table
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own testimonials" ON public.testimonials;
    DROP POLICY IF EXISTS "Users can insert their own testimonials" ON public.testimonials;
    DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;
    
    -- Create new policies
    CREATE POLICY "Users can view their own testimonials" 
        ON public.testimonials 
        FOR SELECT 
        TO authenticated
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own testimonials" 
        ON public.testimonials 
        FOR INSERT 
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Public can view approved testimonials" 
        ON public.testimonials 
        FOR SELECT 
        TO anon, authenticated
        USING (status = 'approved');
END
$$;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
