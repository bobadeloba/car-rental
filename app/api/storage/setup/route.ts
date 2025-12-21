import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// This is a special setup endpoint that doesn't require admin privileges
// It's intended for initial application setup only
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create required buckets
    const requiredBuckets = ["assets", "media", "profile-pictures", "documents"]
    const results = {}

    // Get existing buckets first
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return NextResponse.json({ error: `Failed to list buckets: ${listError.message}` }, { status: 500 })
    }

    const existingBucketNames = existingBuckets.map((b) => b.name)

    // Create buckets that don't exist
    for (const bucketName of requiredBuckets) {
      if (!existingBucketNames.includes(bucketName)) {
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        })

        results[bucketName] = error ? { error: error.message } : "created"
      } else {
        results[bucketName] = "already exists"
      }
    }

    return NextResponse.json({
      success: true,
      buckets: results,
    })
  } catch (error: any) {
    console.error("Error in initial storage setup:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET handler to check the status of storage buckets
export async function GET() {
  try {
    const supabase = await createServerClient()

    // Authenticate the user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get existing buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      buckets: buckets.map((b) => ({
        id: b.id,
        name: b.name,
        public: b.public,
        created_at: b.created_at,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
