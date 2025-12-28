"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

export async function submitTestimonialAction(data: {
  fullName: string
  email: string
  rating: number
  comment: string
}) {
  try {
    const supabase = await getSupabaseServer()

    // Get the current user's ID only
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Authentication required" }
    }

    const userId = session.user.id

    // Insert directly into testimonials table without any user table access
    const { error } = await supabase.from("testimonials").insert({
      user_id: userId,
      full_name: data.fullName,
      email: data.email,
      rating: data.rating,
      comment: data.comment,
      status: "pending",
    })

    if (error) {
      console.error("Error submitting testimonial:", error)
      return { success: false, error: error.message || "Failed to submit testimonial" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in testimonial submission:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
