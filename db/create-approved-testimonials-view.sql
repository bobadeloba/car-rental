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
