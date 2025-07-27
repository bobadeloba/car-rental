-- Create a function to get approved testimonials without accessing the users table
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
