import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Try to use the get_app_settings function first
    const { data: functionData, error: functionError } = await supabase.rpc("get_app_settings")

    if (functionError) {
      console.log("Error using get_app_settings function:", functionError)

      // Fallback to direct query
      const { data, error } = await supabase
        .from("admin_settings")
        .select("logo_url, app_name, whatsapp_phone")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data })
    }

    return NextResponse.json({ data: functionData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
