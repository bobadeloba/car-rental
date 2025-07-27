-- Function to get app settings
CREATE OR REPLACE FUNCTION get_app_settings()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'app_name', app_name,
      'logo_url', logo_url,
      'whatsapp_phone', whatsapp_phone,
      'company_address', company_address,
      'contact_email', contact_email,
      'contact_phone', contact_phone,
      'facebook_url', facebook_url,
      'twitter_url', twitter_url,
      'instagram_url', instagram_url,
      'linkedin_url', linkedin_url,
      'footer_tagline', footer_tagline
    )
    FROM admin_settings
    ORDER BY updated_at DESC
    LIMIT 1
  );
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION get_app_settings() TO service_role;
