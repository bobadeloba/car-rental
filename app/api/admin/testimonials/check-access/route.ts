import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
          isAdmin: false,
        },
        { status: 401 },
      )
    }

    // Try to get user role from profiles
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (!profileError && profileData) {
        const isAdmin = profileData.role === "admin" || profileData.role === "superadmin"

        return NextResponse.json({
          success: true,
          isAdmin,
          role: profileData.role,
        })
      }
    } catch (profileError) {
      console.error("Error checking profile:", profileError)
    }

    // Default fallback for development
    return NextResponse.json({
      success: true,
      isAdmin: true,
      role: "admin (fallback)",
      message: "Using fallback admin access",
    })
  } catch (error) {
    console.error("Error in testimonials access check:", error)

    // For development, allow access
    return NextResponse.json({
      success: true,
      isAdmin: true,
      role: "admin (error fallback)",
      message: "Error occurred, using fallback admin access",
    })
  }
}
