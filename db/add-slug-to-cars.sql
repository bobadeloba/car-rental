-- Add slug column to cars table
ALTER TABLE cars ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS cars_slug_idx ON cars(slug);

-- Function to generate slug from car name and brand
CREATE OR REPLACE FUNCTION generate_car_slug(car_name TEXT, car_brand TEXT, car_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from brand and name
    base_slug := LOWER(TRIM(car_brand || '-' || car_name));
    
    -- Replace spaces and special characters with hyphens
    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
    
    -- Remove leading/trailing hyphens
    base_slug := TRIM(BOTH '-' FROM base_slug);
    
    -- Ensure slug is not empty
    IF base_slug = '' THEN
        base_slug := 'car';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (
        SELECT 1 FROM cars 
        WHERE slug = final_slug 
        AND (car_id IS NULL OR id != car_id)
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing cars
UPDATE cars 
SET slug = generate_car_slug(COALESCE(name, 'car'), COALESCE(brand, 'unknown'), id)
WHERE slug IS NULL;

-- Make slug NOT NULL after populating existing records
ALTER TABLE cars ALTER COLUMN slug SET NOT NULL;
