import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase
      .from("admin_settings")
      .select("app_name, site_name")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({ name: "Kings Rental Cars" })
    }

    return NextResponse.json({ name: data?.site_name || data?.app_name || "Kings Rental Cars" })
  } catch (error: any) {
    return NextResponse.json({ name: "Kings Rental Cars" })
  }
}
