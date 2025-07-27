-- First check if categories exist
DO $$
DECLARE
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count FROM categories;
  
  -- Only insert if we have no categories
  IF category_count = 0 THEN
    -- Insert categories
    INSERT INTO categories (id, name, description, created_at, updated_at)
    VALUES
      (gen_random_uuid(), 'Super Cars', 'Experience the pinnacle of automotive engineering with exceptional speed and design', NOW(), NOW()),
      (gen_random_uuid(), 'Sports Cars', 'Performance vehicles designed for speed and handling', NOW(), NOW()),
      (gen_random_uuid(), 'SUVs', 'Sport Utility Vehicles with increased ground clearance and ruggedness', NOW(), NOW()),
      (gen_random_uuid(), 'Convertibles', 'Vehicles with removable or retractable roof for open-air driving', NOW(), NOW()),
      (gen_random_uuid(), 'Coupes', 'Two-door fixed-roof cars with a sloping rear roofline', NOW(), NOW()),
      (gen_random_uuid(), 'Muscle Cars', 'American high-performance rear-wheel drive cars with powerful engines', NOW(), NOW()),
      (gen_random_uuid(), 'Sedans', 'Four-door passenger cars with a separate trunk', NOW(), NOW()),
      (gen_random_uuid(), 'Electric Vehicles', 'Eco-friendly luxury with cutting-edge battery technology', NOW(), NOW()),
      (gen_random_uuid(), 'Economy Cars', 'Practical and efficient cars for everyday use', NOW(), NOW());
  END IF;
END $$;
