"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

export async function submitPublicTestimonial(data: {
  fullName: string
  email: string
  rating: number
  comment: string
}) {
  try {
    const supabase = await getSupabaseServer()

    // Insert directly into testimonials table without any user table access
    // Use a null user_id for public testimonials
    const { error } = await supabase.from("testimonials").insert({
      user_id: null, // No user ID required
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
