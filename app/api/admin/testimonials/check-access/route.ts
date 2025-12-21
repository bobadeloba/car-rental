import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
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
