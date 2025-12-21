import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {}
          },
        },
      },
    )

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Execute the SQL query to create the testimonials table
    const sqlQuery = `
    -- First, ensure the UUID extension is available
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create the testimonials table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.testimonials (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policies (only if the table was just created)
    DO $$
    BEGIN
        -- Enable row level security
        ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
    
        -- Policy for users to see their own testimonials
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'testimonials' 
            AND policyname = 'Users can view their own testimonials'
        ) THEN
            CREATE POLICY "Users can view their own testimonials" 
                ON public.testimonials 
                FOR SELECT 
                USING (auth.uid() = user_id);
        END IF;
    
        -- Policy for users to insert their own testimonials
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'testimonials' 
            AND policyname = 'Users can insert their own testimonials'
        ) THEN
            CREATE POLICY "Users can insert their own testimonials" 
                ON public.testimonials 
                FOR INSERT 
                WITH CHECK (auth.uid() = user_id);
        END IF;
    
        -- Policy for users to update their own testimonials
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'testimonials' 
            AND policyname = 'Users can update their own testimonials'
        ) THEN
            CREATE POLICY "Users can update their own testimonials" 
                ON public.testimonials 
                FOR UPDATE 
                USING (auth.uid() = user_id AND status = 'pending');
        END IF;
    
        -- Policy for public to view approved testimonials
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'testimonials' 
            AND policyname = 'Public can view approved testimonials'
        ) THEN
            CREATE POLICY "Public can view approved testimonials" 
                ON public.testimonials 
                FOR SELECT 
                USING (status = 'approved');
        END IF;
    
        -- Create a simple admin policy based on email
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'testimonials' 
            AND policyname = 'Admins can manage all testimonials'
        ) THEN
            CREATE POLICY "Admins can manage all testimonials" 
                ON public.testimonials 
                USING (
                    EXISTS (
                        SELECT 1 FROM auth.users
                        WHERE auth.users.id = auth.uid()
                        AND auth.users.email = '${user.email}'
                    )
                );
        END IF;
    END
    $$;
    
    -- Create function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Create trigger to update updated_at on testimonials
    DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
    CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    `

    // Execute the SQL query
    const { error } = await supabase.rpc("exec_sql", { sql: sqlQuery })

    if (error) {
      console.error("Error setting up testimonials:", error)
      return NextResponse.json({ error: `Failed to set up testimonials: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Testimonials table and related components set up successfully",
    })
  } catch (error) {
    console.error("Error in setup-testimonials route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
