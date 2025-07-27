import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase
      .from("admin_settings")
      .select("app_name, site_name, site_description, meta_description, logo_url")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({
        appName: "Kings Rental Cars",
        siteName: "Kings Rental Cars",
        description: "Premium car rental service for all your needs",
        logoUrl: null,
      })
    }

    return NextResponse.json({
      appName: data?.app_name || "Kings Rental Cars",
      siteName: data?.site_name || data?.app_name || "Kings Rental Cars",
      description: data?.meta_description || data?.site_description || "Premium car rental service for all your needs",
      logoUrl: data?.logo_url,
    })
  } catch (error: any) {
    console.error("Error in app-metadata route:", error)
    return NextResponse.json({
      appName: "Kings Rental Cars",
      siteName: "Kings Rental Cars",
      description: "Premium car rental service for all your needs",
      logoUrl: null,
    })
  }
}
