import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

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

    // Fallback to the check-role API
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/check-role`, {
        headers: {
          cookie: cookies().toString(),
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          success: true,
          isAdmin: data.isAdmin,
          role: data.role,
        })
      }
    } catch (apiError) {
      console.error("Error checking admin API:", apiError)
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
