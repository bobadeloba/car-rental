import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get categories
    const { data, error } = await supabase.from("media_categories").select("*").order("name")

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Categories fetch error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    const isAdmin = userData?.role === "admin"
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized. Admin access required." }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { name, description } = body

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Create category
    const { data, error } = await supabase
      .from("media_categories")
      .insert({
        name,
        slug,
        description,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Category creation error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
