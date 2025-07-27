-- Create a function to get the latest admin settings
-- This function bypasses RLS and can be called by anyone
CREATE OR REPLACE FUNCTION public.get_latest_admin_settings()
RETURNS SETOF admin_settings
LANGUAGE sql
SECURITY DEFINER -- Run with definer's privileges (should be a superuser)
AS $$
  SELECT * FROM admin_settings
  ORDER BY updated_at DESC
  LIMIT 1;
$$;

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION public.get_latest_admin_settings() TO public;
