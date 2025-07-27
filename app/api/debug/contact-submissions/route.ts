import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try with admin privileges
    const supabaseAdmin = createServerClient({ admin: true })
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })

    // Try with regular client
    const supabase = createServerClient()
    const { data: regularData, error: regularError } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })

    // Check if table exists
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    return NextResponse.json({
      adminData,
      adminError,
      regularData,
      regularError,
      tables: tables?.map((t) => t.table_name),
      tablesError,
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
