import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.user_id || !body.title || !body.message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Verify the user is creating notifications for themselves or is an admin
    if (body.user_id !== session.user.id) {
      // Check if user is admin
      const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()

      if (!userData || userData.role !== "admin") {
        return NextResponse.json(
          { message: "Forbidden: You can only create notifications for yourself" },
          { status: 403 },
        )
      }
    }

    // Insert notification
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: body.user_id,
        title: body.title,
        message: body.message,
        read: body.read || false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting notification:", error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in notifications API:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
