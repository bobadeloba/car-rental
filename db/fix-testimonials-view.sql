-- Drop the view if it exists
DROP VIEW IF EXISTS public.approved_testimonials;

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

-- Ensure the testimonials table has the correct RLS policies
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

-- Policy for admins to manage all testimonials
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" 
  ON public.testimonials 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
    )
  );
