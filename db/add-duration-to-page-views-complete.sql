-- Add duration column to page_views table
ALTER TABLE page_views 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_bounce BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS exit_type TEXT DEFAULT 'unknown'; -- 'navigation', 'close', 'refresh', 'timeout'

-- Create index for duration queries
CREATE INDEX IF NOT EXISTS idx_page_views_duration ON page_views(duration_seconds);
CREATE INDEX IF NOT EXISTS idx_page_views_is_bounce ON page_views(is_bounce);

-- Update the page_view_stats view to include duration metrics
DROP VIEW IF EXISTS page_view_stats;
CREATE OR REPLACE VIEW page_view_stats AS
SELECT 
  page_path,
  page_title,
  COUNT(*) as total_views,
  COUNT(DISTINCT ip_address) as unique_visitors,
  COUNT(CASE WHEN visited_at >= NOW() - INTERVAL '1 day' THEN 1 END) as views_today,
  COUNT(CASE WHEN visited_at >= NOW() - INTERVAL '7 days' THEN 1 END) as views_last_7_days,
  COUNT(CASE WHEN visited_at >= NOW() - INTERVAL '30 days' THEN 1 END) as views_last_30_days,
  ROUND(AVG(CASE WHEN duration_seconds > 0 THEN duration_seconds::numeric END), 2) as avg_duration_seconds,
  ROUND(AVG(CASE WHEN duration_seconds > 0 THEN duration_seconds::numeric END) / 60.0, 2) as avg_duration_minutes,
  COUNT(CASE WHEN is_bounce = true THEN 1 END) as bounce_count,
  ROUND(
    (COUNT(CASE WHEN is_bounce = true THEN 1 END)::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 
    2
  ) as bounce_rate_percentage,
  COUNT(CASE WHEN duration_seconds >= 30 THEN 1 END) as engaged_sessions,
  ROUND(
    (COUNT(CASE WHEN duration_seconds >= 30 THEN 1 END)::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 
    2
  ) as engagement_rate_percentage,
  MAX(visited_at) as last_visited_at
FROM page_views
GROUP BY page_path, page_title
ORDER BY total_views DESC;

-- Create a simplified view for engagement statistics (without PERCENTILE_CONT)
DROP VIEW IF EXISTS page_engagement_stats;
CREATE OR REPLACE VIEW page_engagement_stats AS
SELECT 
  page_path,
  page_title,
  COUNT(*) as total_sessions,
  ROUND(AVG(CASE WHEN duration_seconds > 0 THEN duration_seconds::numeric END), 2) as avg_duration,
  -- Use a simpler approach for median calculation
  ROUND(
    (SELECT duration_seconds::numeric 
     FROM page_views p2 
     WHERE p2.page_path = p1.page_path AND p2.duration_seconds > 0 
     ORDER BY duration_seconds 
     LIMIT 1 OFFSET (
       SELECT COUNT(*) / 2 
       FROM page_views p3 
       WHERE p3.page_path = p1.page_path AND p3.duration_seconds > 0
     )
    ), 2
  ) as median_duration,
  MAX(duration_seconds) as max_duration,
  COUNT(CASE WHEN duration_seconds < 10 THEN 1 END) as quick_exits,
  COUNT(CASE WHEN duration_seconds BETWEEN 10 AND 30 THEN 1 END) as short_visits,
  COUNT(CASE WHEN duration_seconds BETWEEN 30 AND 120 THEN 1 END) as medium_visits,
  COUNT(CASE WHEN duration_seconds BETWEEN 120 AND 300 THEN 1 END) as long_visits,
  COUNT(CASE WHEN duration_seconds > 300 THEN 1 END) as very_long_visits
FROM page_views p1
WHERE duration_seconds > 0
GROUP BY page_path, page_title
ORDER BY avg_duration DESC;

-- Grant access to the new views
GRANT SELECT ON page_view_stats TO authenticated;
GRANT SELECT ON page_engagement_stats TO authenticated;

-- Enable RLS on page_views table
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read page views" ON page_views;
DROP POLICY IF EXISTS "Allow anonymous users to insert page views" ON page_views;
DROP POLICY IF EXISTS "Allow authenticated users to update page views" ON page_views;

-- Create new policies
CREATE POLICY "Allow authenticated users to read page views" ON page_views
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow anonymous users to insert page views" ON page_views
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update page views" ON page_views
FOR UPDATE TO authenticated USING (true);

-- Insert some sample data for testing (optional)
INSERT INTO page_views (page_path, page_title, ip_address, user_agent, duration_seconds, is_bounce, exit_type)
VALUES 
  ('/', 'Home Page', '192.168.1.1', 'Mozilla/5.0', 45, false, 'navigation'),
  ('/cars', 'Cars Listing', '192.168.1.2', 'Mozilla/5.0', 120, false, 'navigation'),
  ('/about', 'About Us', '192.168.1.3', 'Mozilla/5.0', 8, true, 'close'),
  ('/contact', 'Contact', '192.168.1.4', 'Mozilla/5.0', 180, false, 'navigation'),
  ('/', 'Home Page', '192.168.1.5', 'Mozilla/5.0', 30, false, 'navigation')
ON CONFLICT DO NOTHING;
