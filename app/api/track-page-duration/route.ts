import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pagePath, pageTitle, sessionId, duration, exitType, pageViewId } = body

    if (!duration && duration !== 0) {
      return NextResponse.json({ error: "Duration is required" }, { status: 400 })
    }

    const finalSessionId = sessionId || `server-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    const supabase = await createServerClient()

    const isBounce = duration < 10

    if (pageViewId) {
      const { error } = await supabase
        .from("page_views")
        .update({
          duration_seconds: duration,
          is_bounce: isBounce,
          exit_type: exitType || "navigation",
        })
        .eq("id", pageViewId)

      if (error) {
        console.error("[v0] Error updating page view duration:", error)
        return NextResponse.json(
          {
            error: "Failed to update duration",
            details: error.message,
          },
          { status: 500 },
        )
      }
    } else if (pagePath) {
      const { data: existingView } = await supabase
        .from("page_views")
        .select("id")
        .eq("session_id", finalSessionId)
        .eq("page_path", pagePath)
        .order("visited_at", { ascending: false })
        .limit(1)
        .single()

      if (existingView) {
        const { error } = await supabase
          .from("page_views")
          .update({
            duration_seconds: duration,
            is_bounce: isBounce,
            exit_type: exitType || "navigation",
          })
          .eq("id", existingView.id)

        if (error) {
          console.error("[v0] Error updating existing page view:", error)
          return NextResponse.json(
            {
              error: "Failed to update existing view",
              details: error.message,
            },
            { status: 500 },
          )
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in track-page-duration API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
