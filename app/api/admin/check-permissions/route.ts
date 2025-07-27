import { NextResponse } from "next/server"

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Import the Supabase client dynamically to avoid static generation issues
    const { createServerClient } = await import("@/lib/supabase/server")
    const supabase = await createServerClient()

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if user exists in users table
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", user.id)
      .single()

    if (userDataError) {
      // User doesn't exist in users table, create them
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          role: "admin", // Set as admin for the first user
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: "Failed to create user", details: createError }, { status: 500 })
      }

      return NextResponse.json({
        message: "User created with admin role",
        user: newUser,
        action: "created",
      })
    }

    // If user exists but is not admin, update their role
    if (userData && userData.role !== "admin") {
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ role: "admin" })
        .eq("id", user.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: "Failed to update user role", details: updateError }, { status: 500 })
      }

      return NextResponse.json({
        message: "User role updated to admin",
        user: updatedUser,
        action: "updated",
      })
    }

    // User already exists and is admin
    return NextResponse.json({
      message: "User already has admin role",
      user: userData,
      action: "none",
    })
  } catch (error) {
    console.error("Admin check error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
