import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Fetch the most recent settings
    const { data, error } = await supabase
      .from("admin_settings")
      .select(`
        site_name,
        footer_tagline,
        contact_email,
        contact_phone,
        site_address_line1,
        site_address_line2,
        site_address_city,
        site_address_state,
        site_address_country,
        site_address_postal,
        social_facebook,
        social_twitter,
        social_instagram,
        social_youtube
      `)
      .order("updated_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching footer data:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data && data.length > 0 ? data[0] : null })
  } catch (error) {
    console.error("Error in footer data route:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
