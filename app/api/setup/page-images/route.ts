import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
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

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Call the create_page_images_table function
    const { error } = await supabase.rpc("create_page_images_table")

    if (error) {
      console.error("Error creating page_images table:", error)
      return NextResponse.json({ message: "Failed to create page_images table: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Page images table created successfully" })
  } catch (error: any) {
    console.error("Error setting up page images:", error)
    return NextResponse.json(
      { message: "Error setting up page images: " + (error.message || "Unknown error") },
      { status: 500 },
    )
  }
}
