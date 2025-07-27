import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the request body
    const { fullName, email, rating, comment } = await request.json()

    // Validate the input
    if (!fullName || !email || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Submit the testimonial without checking the users table
    const { error } = await supabase.from("testimonials").insert({
      user_id: user.id,
      full_name: fullName,
      email: email,
      rating: rating,
      comment: comment,
      status: "pending",
    })

    if (error) {
      console.error("Error submitting testimonial:", error)
      return NextResponse.json({ error: error.message || "Failed to submit testimonial" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in testimonial submission:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
