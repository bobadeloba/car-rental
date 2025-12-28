"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

async function isAdmin() {
  try {
    const supabase = await getSupabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return false

    // Check if the user has admin role in the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle()

    if (userError) {
      console.error("Error checking admin status:", userError)
      return false
    }

    return userData?.role === "admin"
  } catch (error) {
    console.error("Error in isAdmin check:", error)
    return false
  }
}

export async function getMyTestimonials() {
  try {
    const supabase = await getSupabaseServer()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: [], error: "Not authenticated", tableExists: true }
    }

    // Check if testimonials table exists
    const { error: tableCheckError } = await supabase.from("testimonials").select("id").limit(1).maybeSingle()

    const tableExists = !tableCheckError || !tableCheckError.message.includes("does not exist")

    if (!tableExists) {
      return { data: [], error: "Testimonials table does not exist", tableExists: false }
    }

    // Get the user's testimonials
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user testimonials:", error)
      return { data: [], error: "Failed to load testimonials", tableExists: true }
    }

    return { data: data || [], error: null, tableExists: true }
  } catch (error) {
    console.error("Error in getUserTestimonials:", error)
    return { data: [], error: "An unexpected error occurred", tableExists: true }
  }
}

export async function submitTestimonial(formData: FormData) {
  try {
    const supabase = await getSupabaseServer()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to submit a testimonial." }
    }

    // Extract form data
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const rating = Number.parseInt(formData.get("rating") as string)
    const comment = formData.get("comment") as string

    // Validate the input
    if (!fullName || !email || !rating || !comment) {
      return { error: "All fields are required." }
    }

    // Submit the testimonial
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
      return { error: error.message || "Failed to submit testimonial. Please try again." }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in submitTestimonial:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
