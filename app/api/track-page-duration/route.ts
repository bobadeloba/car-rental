import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pagePath, pageTitle, sessionId, duration, exitType, pageViewId } = body

    if (!pagePath || !duration) {
      return NextResponse.json({ error: "Page path and duration are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Determine if this is a bounce (less than 10 seconds and single page view)
    const isBounce = duration < 10

    if (pageViewId) {
      // Update existing page view record with duration
      const { error } = await supabase
        .from("page_views")
        .update({
          duration_seconds: duration,
          is_bounce: isBounce,
          exit_type: exitType,
        })
        .eq("id", pageViewId)

      if (error) {
        console.error("Error updating page view duration:", error)
        return NextResponse.json({ error: "Failed to update page view duration" }, { status: 500 })
      }
    } else {
      // Create new record or find existing one by session and page
      const { data: existingView } = await supabase
        .from("page_views")
        .select("id")
        .eq("session_id", sessionId)
        .eq("page_path", pagePath)
        .order("visited_at", { ascending: false })
        .limit(1)
        .single()

      if (existingView) {
        // Update existing record
        const { error } = await supabase
          .from("page_views")
          .update({
            duration_seconds: duration,
            is_bounce: isBounce,
            exit_type: exitType,
          })
          .eq("id", existingView.id)

        if (error) {
          console.error("Error updating existing page view:", error)
        }
      } else {
        // Create new record with duration
        const { error } = await supabase.from("page_views").insert({
          page_path: pagePath,
          page_title: pageTitle,
          session_id: sessionId,
          duration_seconds: duration,
          is_bounce: isBounce,
          exit_type: exitType,
          user_id: user?.id || null,
        })

        if (error) {
          console.error("Error creating page view with duration:", error)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in track-page-duration API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
