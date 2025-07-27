-- Create car_views table to track how many times each car is viewed
CREATE TABLE IF NOT EXISTS car_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance on queries
CREATE INDEX IF NOT EXISTS idx_car_views_car_id ON car_views(car_id);
CREATE INDEX IF NOT EXISTS idx_car_views_viewed_at ON car_views(viewed_at);

-- Enable RLS (Row Level Security)
ALTER TABLE car_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to read all data
CREATE POLICY "Admins can view all car views" ON car_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create policy to allow anyone to insert (for tracking)
CREATE POLICY "Anyone can insert car views" ON car_views
  FOR INSERT WITH CHECK (true);
