-- Create a function to create the page_images table if it doesn't exist
CREATE OR REPLACE FUNCTION create_page_images_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'page_images'
  ) THEN
    -- Create the page_images table
    CREATE TABLE public.page_images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      page TEXT NOT NULL,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      alt_text TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add a unique constraint on the page column
    ALTER TABLE public.page_images ADD CONSTRAINT page_images_page_key UNIQUE (page);

    -- Set up RLS policies
    ALTER TABLE public.page_images ENABLE ROW LEVEL SECURITY;

    -- Allow authenticated users to select
    CREATE POLICY page_images_select_policy
      ON public.page_images
      FOR SELECT
      USING (true);

    -- Allow authenticated users to insert
    CREATE POLICY page_images_insert_policy
      ON public.page_images
      FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');

    -- Allow authenticated users to update
    CREATE POLICY page_images_update_policy
      ON public.page_images
      FOR UPDATE
      USING (auth.role() = 'authenticated');

    -- Allow authenticated users to delete
    CREATE POLICY page_images_delete_policy
      ON public.page_images
      FOR DELETE
      USING (auth.role() = 'authenticated');

    RAISE NOTICE 'Created page_images table with RLS policies';
  ELSE
    RAISE NOTICE 'page_images table already exists';
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_page_images_table() TO authenticated;
GRANT EXECUTE ON FUNCTION create_page_images_table() TO anon;
GRANT EXECUTE ON FUNCTION create_page_images_table() TO service_role;
