import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error } = await supabase
      .from("admin_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data && data.length > 0 ? data[0] : null })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
