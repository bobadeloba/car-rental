import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Create a Supabase client with the service role key
const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: Request) {
  try {
    // Create a regular Supabase client for auth checks
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const filePath = formData.get("filePath") as string

    if (!file || !filePath) {
      return NextResponse.json({ message: "File and file path are required" }, { status: 400 })
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: "File type not allowed. Use JPG, PNG, or PDF" }, { status: 400 })
    }

    // Sanitize file path to prevent directory traversal attacks
    const sanitizedPath = filePath.replace(/\.\./g, "").replace(/^\/+/, "")

    // Add user ID to path for better isolation
    const userSpecificPath = `${session.user.id}/${sanitizedPath}`

    // Create a service role client to bypass RLS
    const serviceClient = createServiceClient()

    // Upload file to storage
    const { data, error } = await serviceClient.storage.from("documents").upload(userSpecificPath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type, // Set the correct content type
    })

    if (error) {
      console.error("Storage upload error:", error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = serviceClient.storage.from("documents").getPublicUrl(userSpecificPath)

    return NextResponse.json({ path: publicUrlData.publicUrl })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
