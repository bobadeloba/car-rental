"use server"

import { getSupabaseServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Check if user is admin using the users table
async function isAdmin() {
  try {
    const supabase = getSupabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("No session found")
      return false
    }

    // Check if the user has admin role in the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError) {
      console.error("Error checking admin status:", userError)

      // Fallback: Check if the user's email contains 'admin'
      if (session.user.email && session.user.email.includes("admin")) {
        console.log("Admin access granted based on email containing 'admin'")
        return true
      }

      return false
    }

    const isUserAdmin = userData?.role === "admin"
    console.log(`User ${session.user.email} has role: ${userData?.role}, isAdmin: ${isUserAdmin}`)
    return isUserAdmin
  } catch (error) {
    console.error("Error in isAdmin check:", error)
    return false
  }
}

export async function getAllTestimonials() {
  try {
    const adminCheck = await isAdmin()

    if (!adminCheck) {
      console.warn("Unauthorized access attempt to testimonials admin")
      return [] // Return empty array instead of throwing error
    }

    const supabase = getSupabaseServer()

    // Check if testimonials table exists
    const { error: tableCheckError } = await supabase.from("testimonials").select("id").limit(1).maybeSingle()

    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      console.log("Testimonials table does not exist yet")
      return []
    }

    // Fetch testimonials without joining with users table
    const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching testimonials:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllTestimonials:", error)
    return [] // Return empty array on error
  }
}

export async function updateTestimonialStatus(id: string, status: "pending" | "approved" | "rejected") {
  try {
    const adminCheck = await isAdmin()

    if (!adminCheck) {
      return {
        success: false,
        message: "Unauthorized. You must be an admin to perform this action.",
      }
    }

    const supabase = getSupabaseServer()

    const { error } = await supabase.from("testimonials").update({ status }).eq("id", id)

    if (error) {
      console.error("Error updating testimonial status:", error)
      return {
        success: false,
        message: "Failed to update testimonial status",
      }
    }

    revalidatePath("/admin/testimonials")
    revalidatePath("/testimonials")
    revalidatePath("/")

    return {
      success: true,
      message: `Testimonial ${status} successfully`,
    }
  } catch (error) {
    console.error("Error in updateTestimonialStatus:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}

export async function deleteTestimonial(id: string) {
  try {
    const adminCheck = await isAdmin()

    if (!adminCheck) {
      return {
        success: false,
        message: "Unauthorized. You must be an admin to perform this action.",
      }
    }

    const supabase = getSupabaseServer()

    const { error } = await supabase.from("testimonials").delete().eq("id", id)

    if (error) {
      console.error("Error deleting testimonial:", error)
      return {
        success: false,
        message: "Failed to delete testimonial",
      }
    }

    revalidatePath("/admin/testimonials")
    revalidatePath("/testimonials")
    revalidatePath("/")

    return {
      success: true,
      message: "Testimonial deleted successfully",
    }
  } catch (error) {
    console.error("Error in deleteTestimonial:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}
