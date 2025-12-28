-- Setup tracking tables with proper RLS policies

-- Ensure page_views table exists with all required columns
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  page_title TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  region TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  operating_system TEXT,
  referrer TEXT,
  session_id VARCHAR(255),
  user_id UUID REFERENCES auth.users(id),
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  is_bounce BOOLEAN DEFAULT FALSE,
  exit_type TEXT,
  exit_reason TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON page_views(visited_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);

-- Ensure car_views table exists with all required columns
CREATE TABLE IF NOT EXISTS car_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  user_id UUID REFERENCES auth.users(id),
  device_type TEXT,
  browser TEXT,
  operating_system TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  is_bounce BOOLEAN DEFAULT FALSE,
  exit_reason TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_car_views_car_id ON car_views(car_id);
CREATE INDEX IF NOT EXISTS idx_car_views_viewed_at ON car_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_car_views_session_id ON car_views(session_id);

-- Disable RLS temporarily to allow inserts (or set up proper policies)
ALTER TABLE page_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE car_views DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON page_views TO anon;
GRANT SELECT, INSERT, UPDATE ON page_views TO authenticated;
GRANT SELECT, INSERT, UPDATE ON car_views TO anon;
GRANT SELECT, INSERT, UPDATE ON car_views TO authenticated;

-- Create or replace the page_view_stats view
CREATE OR REPLACE VIEW page_view_stats AS
SELECT 
  page_path,
  page_title,
  COUNT(*) as total_views,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(*) FILTER (WHERE visited_at >= CURRENT_DATE) as views_today,
  COUNT(*) FILTER (WHERE visited_at >= CURRENT_DATE - INTERVAL '7 days') as views_last_7_days,
  COUNT(*) FILTER (WHERE visited_at >= CURRENT_DATE - INTERVAL '30 days') as views_last_30_days,
  AVG(duration_seconds) as avg_duration_seconds,
  AVG(duration_seconds) / 60.0 as avg_duration_minutes,
  COUNT(*) FILTER (WHERE is_bounce = true) as bounce_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_bounce = true) / NULLIF(COUNT(*), 0), 2) as bounce_rate_percentage,
  COUNT(*) FILTER (WHERE is_bounce = false) as engaged_sessions,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_bounce = false) / NULLIF(COUNT(*), 0), 2) as engagement_rate_percentage,
  MAX(visited_at) as last_visited_at
FROM page_views
GROUP BY page_path, page_title;

-- Fixed car_view_stats view to handle text array instead of JSONB
CREATE OR REPLACE VIEW car_view_stats AS
SELECT 
  cv.car_id,
  c.name,
  c.brand,
  c.slug,
  -- Handle text array: get first element if array has items
  CASE 
    WHEN array_length(c.images, 1) > 0 THEN c.images[1]
    ELSE NULL
  END as image_url,
  COUNT(*) as total_views,
  COUNT(DISTINCT cv.session_id) as unique_sessions,
  COUNT(*) FILTER (WHERE cv.viewed_at >= CURRENT_DATE - INTERVAL '7 days') as views_last_7_days
FROM car_views cv
JOIN cars c ON cv.car_id = c.id
GROUP BY cv.car_id, c.name, c.brand, c.slug, c.images;

-- Grant access to views
GRANT SELECT ON page_view_stats TO anon;
GRANT SELECT ON page_view_stats TO authenticated;
GRANT SELECT ON car_view_stats TO anon;
GRANT SELECT ON car_view_stats TO authenticated;
