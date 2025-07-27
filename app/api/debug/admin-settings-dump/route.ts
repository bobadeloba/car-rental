import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

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
