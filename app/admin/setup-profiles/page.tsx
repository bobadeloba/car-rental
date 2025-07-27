import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseServer } from "@/lib/supabase/server"

async function setupProfiles() {
  "use server"

  const supabase = getSupabaseServer()

  // Read the SQL file content
  const sqlContent = `
  -- Check if the profiles table exists
  DO $$
  BEGIN
      IF NOT EXISTS (
          SELECT FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename = 'profiles'
      ) THEN
          -- Create the profiles table
          CREATE TABLE public.profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
              email TEXT,
              first_name TEXT,
              last_name TEXT,
              role TEXT DEFAULT 'user',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Add RLS policies
          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

          -- Create policy to allow users to read their own profile
          CREATE POLICY "Users can read their own profile"
              ON public.profiles
              FOR SELECT
              USING (auth.uid() = id);

          -- Create policy to allow users to update their own profile
          CREATE POLICY "Users can update their own profile"
              ON public.profiles
              FOR UPDATE
              USING (auth.uid() = id);

          -- Create policy to allow admins to read all profiles
          CREATE POLICY "Admins can read all profiles"
              ON public.profiles
              FOR SELECT
              USING (
                  EXISTS (
                      SELECT 1 FROM public.profiles
                      WHERE id = auth.uid() AND role = 'admin'
                  )
              );

          -- Create policy to allow admins to update all profiles
          CREATE POLICY "Admins can update all profiles"
              ON public.profiles
              FOR UPDATE
              USING (
                  EXISTS (
                      SELECT 1 FROM public.profiles
                      WHERE id = auth.uid() AND role = 'admin'
                  )
              );

          -- Create policy to allow admins to insert profiles
          CREATE POLICY "Admins can insert profiles"
              ON public.profiles
              FOR INSERT
              WITH CHECK (
                  EXISTS (
                      SELECT 1 FROM public.profiles
                      WHERE id = auth.uid() AND role = 'admin'
                  )
              );

          -- Create policy to allow service role to manage all profiles
          CREATE POLICY "Service role can manage all profiles"
              ON public.profiles
              USING (true)
              WITH CHECK (true);

          -- Insert a default admin user if auth.users has any records
          INSERT INTO public.profiles (id, email, role)
          SELECT id, email, 'admin'
          FROM auth.users
          LIMIT 1;

          RAISE NOTICE 'Created profiles table with default admin user';
      END IF;
  END $$;
  `

  // Execute the SQL
  const { error } = await supabase.rpc("exec_sql", { sql: sqlContent })

  if (error) {
    console.error("Error setting up profiles table:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export default async function SetupProfilesPage() {
  const supabase = getSupabaseServer()

  // Check if profiles table exists
  const { error } = await supabase.from("profiles").select("id").limit(1)

  // If profiles table exists, redirect to admin dashboard
  if (!error) {
    redirect("/admin")
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Setup Profiles Table</CardTitle>
          <CardDescription>Create the profiles table to manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will create the profiles table and set up the necessary permissions. The first user in the system will
            be assigned the admin role.
          </p>
        </CardContent>
        <CardFooter>
          <form action={setupProfiles}>
            <Button type="submit">Setup Profiles Table</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
