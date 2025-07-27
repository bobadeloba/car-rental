-- Drop existing objects if they exist
DROP VIEW IF EXISTS page_view_stats CASCADE;
DROP VIEW IF EXISTS page_view_locations CASCADE;
DROP VIEW IF EXISTS page_view_devices CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;

-- Create page_views table to track page visits
CREATE TABLE page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  region TEXT,
  user_agent TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  operating_system TEXT,
  referrer TEXT,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_page_views_page_path ON page_views(page_path);
CREATE INDEX idx_page_views_visited_at ON page_views(visited_at);
CREATE INDEX idx_page_views_country ON page_views(country);
CREATE INDEX idx_page_views_device_type ON page_views(device_type);
CREATE INDEX idx_page_views_user_id ON page_views(user_id);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);

-- Enable RLS (Row Level Security)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to read all data
CREATE POLICY "Admins can view all page views" ON page_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create policy to allow anyone to insert (for tracking)
CREATE POLICY "Anyone can insert page views" ON page_views
  FOR INSERT WITH CHECK (true);

-- Create a view for page view statistics
CREATE VIEW page_view_stats AS
SELECT 
  page_path,
  page_title,
  COUNT(*) as total_views,
  COUNT(DISTINCT COALESCE(ip_address::text, session_id)) as unique_visitors,
  COUNT(CASE WHEN visited_at >= NOW() - INTERVAL '1 day' THEN 1 END) as views_today,
  COUNT(CASE WHEN visited_at >= NOW() - INTERVAL '7 days' THEN 1 END) as views_last_7_days,
  COUNT(CASE WHEN visited_at >= NOW() - INTERVAL '30 days' THEN 1 END) as views_last_30_days,
  MAX(visited_at) as last_visited_at
FROM page_views
GROUP BY page_path, page_title
ORDER BY total_views DESC;

-- Create a view for location statistics
CREATE VIEW page_view_locations AS
SELECT 
  COALESCE(country, 'Unknown') as country,
  COALESCE(city, 'Unknown') as city,
  COALESCE(region, 'Unknown') as region,
  COUNT(*) as total_views,
  COUNT(DISTINCT COALESCE(ip_address::text, session_id)) as unique_visitors,
  COUNT(CASE WHEN visited_at >= NOW() - INTERVAL '7 days' THEN 1 END) as views_last_7_days
FROM page_views
GROUP BY country, city, region
ORDER BY total_views DESC;

-- Create a view for device statistics
CREATE VIEW page_view_devices AS
SELECT 
  COALESCE(device_type, 'Unknown') as device_type,
  COALESCE(browser, 'Unknown') as browser,
  COALESCE(operating_system, 'Unknown') as operating_system,
  COUNT(*) as total_views,
  COUNT(DISTINCT COALESCE(ip_address::text, session_id)) as unique_visitors,
  COUNT(CASE WHEN visited_at >= NOW() - INTERVAL '7 days' THEN 1 END) as views_last_7_days
FROM page_views
GROUP BY device_type, browser, operating_system
ORDER BY total_views DESC;

-- Grant access to the views for authenticated users
GRANT SELECT ON page_view_stats TO authenticated;
GRANT SELECT ON page_view_locations TO authenticated;
GRANT SELECT ON page_view_devices TO authenticated;
GRANT SELECT ON page_views TO authenticated;

-- Insert some sample data for testing
INSERT INTO page_views (page_path, page_title, country, city, device_type, browser, operating_system, session_id) VALUES
('/cars', 'Cars - Luxury Car Rental', 'United States', 'New York', 'desktop', 'Chrome', 'Windows', 'session_1'),
('/cars/zeekr-001', 'Zeekr 001 - Luxury Car Rental', 'United States', 'Los Angeles', 'mobile', 'Safari', 'iOS', 'session_2'),
('/', 'Home - Luxury Car Rental', 'United Kingdom', 'London', 'desktop', 'Firefox', 'macOS', 'session_3'),
('/about', 'About Us - Luxury Car Rental', 'Canada', 'Toronto', 'tablet', 'Chrome', 'Android', 'session_4'),
('/contact', 'Contact - Luxury Car Rental', 'Australia', 'Sydney', 'mobile', 'Chrome', 'Android', 'session_5');
