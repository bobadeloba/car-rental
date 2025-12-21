import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Helper function to extract filename from URL
function getFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    return pathParts[pathParts.length - 1]
  } catch (error) {
    console.error("Invalid URL:", error)
    return null
  }
}

async function createSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
  })
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseClient()
    const { id } = await params

    const { data, error } = await supabase.from("media").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseClient()
    const { id } = await params

    // Get request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("media")
      .update({
        name: body.name,
        alt_text: body.alt_text,
        category: body.category,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseClient()
    const { id } = await params

    // First get the media item to get the file path
    const { data: media, error: fetchError } = await supabase.from("media").select("file_path").eq("id", id).single()

    if (fetchError) {
      return NextResponse.json({ message: fetchError.message }, { status: 404 })
    }

    // Extract filename from URL
    const filename = getFilenameFromUrl(media.file_path)

    // Delete from storage if we have a valid filename
    if (filename) {
      const { error: storageError } = await supabase.storage.from("media").remove([filename])

      if (storageError) {
        console.warn("Warning: Could not delete file from storage:", storageError)
        // Continue with database deletion even if storage deletion fails
      }
    } else {
      console.warn("Warning: Could not extract filename from URL:", media.file_path)
    }

    // Delete from database
    const { error: dbError } = await supabase.from("media").delete().eq("id", id)

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
