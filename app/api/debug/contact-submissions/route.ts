import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: adminData, error: adminError } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })

    return NextResponse.json({
      data: adminData,
      error: adminError,
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
