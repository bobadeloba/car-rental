import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// This endpoint initializes necessary storage buckets for the application
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

    // Try to check if user is admin, but don't fail if the check doesn't work
    try {
      const { data: user } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      // Log the user data for debugging
      console.log("User data:", user)

      // Only enforce admin check if we successfully got user data and the role field exists
      if (user && user.role !== undefined && user.role !== "admin") {
        return NextResponse.json(
          {
            error: "Admin access required",
            details: "Your account does not have admin privileges.",
          },
          { status: 403 },
        )
      }
    } catch (error) {
      // Log the error but continue - this allows setup to work even if profiles table isn't set up yet
      console.warn("Could not verify admin status:", error)
      // We'll continue anyway since this might be initial setup
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

    // Create public policies for all buckets
    for (const bucketName of requiredBuckets) {
      try {
        // Create policies using SQL since the storage API doesn't have policy management
        // This is a simplified version since we can't execute direct SQL here
        // The actual SQL would be run through the script in db/create-media-buckets.sql
        results[`${bucketName}_policies`] = "policy creation should be done via SQL"
      } catch (policyError: any) {
        results[`${bucketName}_policies`] = { error: policyError.message }
      }
    }

    // After the bucket initialization code, add:
    await supabase.rpc("create_media_bucket_policies")

    return NextResponse.json({
      success: true,
      buckets: results,
    })
  } catch (error: any) {
    console.error("Error initializing storage:", error)
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
