-- Check if the media table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'media') THEN
    -- Create the media table
    CREATE TABLE public.media (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      size INTEGER,
      alt_text TEXT,
      category TEXT DEFAULT 'general',
      is_active BOOLEAN DEFAULT true,
      width INTEGER,
      height INTEGER,
      position TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add RLS policies
    ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
    
    -- Allow authenticated users to view media
    CREATE POLICY "Allow authenticated users to view media" 
      ON public.media FOR SELECT 
      USING (auth.role() = 'authenticated');
    
    -- Allow admins to insert, update, delete media
    CREATE POLICY "Allow admins to manage media" 
      ON public.media FOR ALL 
      USING (auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE role = 'admin'
      ));
  END IF;
END
$$;
