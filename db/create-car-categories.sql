-- Create car_categories junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS car_categories (
  id SERIAL PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(car_id, category_id)
);

-- Add some example relationships between cars and categories
-- Note: These are placeholder values. You'll need to replace with actual IDs from your database
-- INSERT INTO car_categories (car_id, category_id) VALUES
-- ('car-id-1', 'category-id-1'),
-- ('car-id-2', 'category-id-2');
