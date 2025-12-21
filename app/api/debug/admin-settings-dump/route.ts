import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
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

  // Try different queries to see what's happening
  const { data: allSettings, error: allError } = await supabase.from("admin_settings").select("*")

  const { data: orderedSettings, error: orderedError } = await supabase
    .from("admin_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)

  return NextResponse.json({
    allSettings,
    allError,
    orderedSettings,
    orderedError,
    message: "This endpoint shows all admin settings for debugging",
  })
}
