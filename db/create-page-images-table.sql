-- Check if the page_images table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'page_images') THEN
    -- Create the page_images table
    CREATE TABLE public.page_images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      page TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      alt_text TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add RLS policies
    ALTER TABLE public.page_images ENABLE ROW LEVEL SECURITY;
    
    -- Allow all authenticated users to view page images
    CREATE POLICY "Allow authenticated users to view page images" 
      ON public.page_images FOR SELECT 
      USING (auth.role() = 'authenticated');
    
    -- Allow admins to insert, update, delete page images
    CREATE POLICY "Allow admins to manage page images" 
      ON public.page_images FOR ALL 
      USING (auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE role = 'admin'
      ));
  END IF;
END
$$;
