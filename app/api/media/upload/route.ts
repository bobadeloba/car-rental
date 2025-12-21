import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
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
      return NextResponse.json({ message: "Unauthorized. Please sign in." }, { status: 401 })
    }

    // Parse the form data
    let formData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error("Error parsing form data:", error)
      return NextResponse.json({ message: "Invalid form data" }, { status: 400 })
    }

    const file = formData.get("file") as File
    const category = formData.get("category") as string
    const altText = formData.get("alt_text") as string
    const fileName = formData.get("name") as string

    if (!file) {
      return NextResponse.json({ message: "File is required" }, { status: 400 })
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          message: "File type not allowed. Use JPG, PNG, GIF, SVG, or WebP",
          allowedTypes,
        },
        { status: 400 },
      )
    }

    // Generate a unique file name
    const fileExt = file.name.split(".").pop()
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
    const storagePath = `${uniqueId}.${fileExt}`

    // Upload file to storage
    try {
      const { data, error } = await supabase.storage.from("media").upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      })

      if (error) {
        console.error("Storage upload error:", error)
        return NextResponse.json({ message: error.message }, { status: 500 })
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(storagePath)

      if (!publicUrlData || !publicUrlData.publicUrl) {
        return NextResponse.json({ message: "Failed to get public URL" }, { status: 500 })
      }

      // Create media record in database
      try {
        const { data: mediaData, error: dbError } = await supabase
          .from("media")
          .insert({
            name: fileName || file.name,
            file_path: publicUrlData.publicUrl,
            file_type: file.type,
            size: file.size,
            category: category || "general",
            alt_text: altText || "",
            created_by: session.user.id,
            updated_by: session.user.id,
          })
          .select()
          .single()

        if (dbError) {
          console.error("Database error:", dbError)

          // Try to clean up the uploaded file
          try {
            await supabase.storage.from("media").remove([storagePath])
          } catch (cleanupError) {
            console.error("Failed to clean up orphaned file:", cleanupError)
          }

          return NextResponse.json({ message: dbError.message }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          url: publicUrlData.publicUrl,
          media: mediaData,
        })
      } catch (dbError) {
        console.error("Database operation error:", dbError)
        return NextResponse.json({ message: "Database operation failed" }, { status: 500 })
      }
    } catch (storageError) {
      console.error("Storage operation error:", storageError)
      return NextResponse.json({ message: "Storage operation failed" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        message: error.message || "Internal server error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
