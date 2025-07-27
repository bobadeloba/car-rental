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
  ROUND(AVG(CASE WHEN duration_seconds > 0 THEN duration_seconds END), 2) as avg_duration_seconds,
  ROUND(AVG(CASE WHEN duration_seconds > 0 THEN duration_seconds END) / 60.0, 2) as avg_duration_minutes,
  COUNT(CASE WHEN is_bounce = true THEN 1 END) as bounce_count,
  ROUND(
    (COUNT(CASE WHEN is_bounce = true THEN 1 END)::float / COUNT(*)::float) * 100, 
    2
  ) as bounce_rate_percentage,
  COUNT(CASE WHEN duration_seconds >= 30 THEN 1 END) as engaged_sessions,
  ROUND(
    (COUNT(CASE WHEN duration_seconds >= 30 THEN 1 END)::float / COUNT(*)::float) * 100, 
    2
  ) as engagement_rate_percentage,
  MAX(visited_at) as last_visited_at
FROM page_views
GROUP BY page_path, page_title
ORDER BY total_views DESC;

-- Create a view for engagement statistics
CREATE OR REPLACE VIEW page_engagement_stats AS
SELECT 
  page_path,
  page_title,
  COUNT(*) as total_sessions,
  ROUND(AVG(CASE WHEN duration_seconds > 0 THEN duration_seconds END), 2) as avg_duration,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_seconds), 2) as median_duration,
  MAX(duration_seconds) as max_duration,
  COUNT(CASE WHEN duration_seconds < 10 THEN 1 END) as quick_exits,
  COUNT(CASE WHEN duration_seconds BETWEEN 10 AND 30 THEN 1 END) as short_visits,
  COUNT(CASE WHEN duration_seconds BETWEEN 30 AND 120 THEN 1 END) as medium_visits,
  COUNT(CASE WHEN duration_seconds BETWEEN 120 AND 300 THEN 1 END) as long_visits,
  COUNT(CASE WHEN duration_seconds > 300 THEN 1 END) as very_long_visits,
  exit_type,
  COUNT(*) as exit_count
FROM page_views
WHERE duration_seconds > 0
GROUP BY page_path, page_title, exit_type
ORDER BY avg_duration DESC;

-- Grant access to the new view
GRANT SELECT ON page_engagement_stats TO authenticated;
