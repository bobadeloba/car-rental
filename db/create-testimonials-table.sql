-- Create testimonials table with approval workflow
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

-- Add RLS policies
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policy for users to view only approved testimonials
CREATE POLICY "View approved testimonials" 
  ON public.testimonials 
  FOR SELECT 
  USING (status = 'approved');

-- Policy for users to insert their own testimonials
CREATE POLICY "Users can add testimonials" 
  ON public.testimonials 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to view their own testimonials regardless of status
CREATE POLICY "Users can view their own testimonials" 
  ON public.testimonials 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for admins to manage all testimonials
CREATE POLICY "Admins can manage testimonials" 
  ON public.testimonials 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
    )
  );

-- Create function to update updated_at timestamp
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
