-- First, check if the car_categories table exists
CREATE TABLE IF NOT EXISTS car_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(car_id, category_id)
);

-- Add some example relationships between cars and categories
-- We'll add a few sample relationships assuming both cars and categories exist
-- You may need to adjust these IDs based on your actual data

-- Get some car IDs
WITH car_ids AS (
  SELECT id FROM cars LIMIT 10
),
-- Get category IDs
category_ids AS (
  SELECT id FROM categories
)
-- Insert relationships (each car can belong to multiple categories)
INSERT INTO car_categories (car_id, category_id)
SELECT 
  car_ids.id, 
  category_ids.id
FROM 
  car_ids 
CROSS JOIN 
  category_ids
ON CONFLICT (car_id, category_id) DO NOTHING;

-- Add some specific relationships for testing
-- For example, assign all sports cars to the "Sports Cars" category
WITH sports_cars AS (
  SELECT id FROM cars WHERE model ILIKE '%sport%' OR description ILIKE '%sport%'
),
sports_category AS (
  SELECT id FROM categories WHERE name ILIKE 'Sports Cars' LIMIT 1
)
INSERT INTO car_categories (car_id, category_id)
SELECT 
  sports_cars.id, 
  sports_category.id
FROM 
  sports_cars, 
  sports_category
ON CONFLICT (car_id, category_id) DO NOTHING;

-- Assign luxury cars to "Super Cars" category
WITH luxury_cars AS (
  SELECT id FROM cars WHERE model ILIKE '%luxury%' OR description ILIKE '%luxury%' OR daily_rate > 1000
),
luxury_category AS (
  SELECT id FROM categories WHERE name ILIKE 'Super Cars' LIMIT 1
)
INSERT INTO car_categories (car_id, category_id)
SELECT 
  luxury_cars.id, 
  luxury_category.id
FROM 
  luxury_cars, 
  luxury_category
ON CONFLICT (car_id, category_id) DO NOTHING;

-- Assign SUVs
WITH suv_cars AS (
  SELECT id FROM cars WHERE model ILIKE '%SUV%' OR description ILIKE '%SUV%'
),
suv_category AS (
  SELECT id FROM categories WHERE name ILIKE 'SUVs' LIMIT 1
)
INSERT INTO car_categories (car_id, category_id)
SELECT 
  suv_cars.id, 
  suv_category.id
FROM 
  suv_cars, 
  suv_category
ON CONFLICT (car_id, category_id) DO NOTHING;
