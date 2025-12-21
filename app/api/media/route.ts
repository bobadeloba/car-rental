import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get media items
    const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching media:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to match the expected format
    const formattedData = (data || []).map((item) => ({
      id: item.id,
      name: item.name || item.filename || "Untitled",
      url: item.file_path || item.url,
      type: item.mime_type || item.type || "image",
      size: item.size || 0,
      created_at: item.created_at,
    }))

    // Return as an array to ensure consistency
    return NextResponse.json(formattedData)
  } catch (error: any) {
    console.error("Error in media API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()

    // Insert media item
    const { data, error } = await supabase.from("media").insert(body).select()

    if (error) {
      console.error("Error inserting media:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("Error in media API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
