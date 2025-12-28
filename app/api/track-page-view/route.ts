import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { detectDevice } from "@/lib/device-detector"
import { detectLocation } from "@/lib/location-detector"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pagePath, pageTitle, sessionId, startTime } = body

    if (!pagePath) {
      return NextResponse.json({ error: "Page path is required" }, { status: 400 })
    }

    const finalSessionId = sessionId || `server-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    const supabase = await createServerClient()

    // Get user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get IP address
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ipAddress = forwarded?.split(",")[0]?.trim() || realIp || null

    // Get user agent
    const userAgent = request.headers.get("user-agent") || ""

    // Detect device information
    const deviceInfo = detectDevice(userAgent)

    // Detect location (async)
    const locationInfo = await detectLocation(ipAddress || "")

    // Get referrer
    const referrer = request.headers.get("referer") || ""

    // Insert page view
    const { data, error } = await supabase
      .from("page_views")
      .insert({
        page_path: pagePath,
        page_title: pageTitle || pagePath,
        ip_address: ipAddress,
        country: locationInfo.country || null,
        city: locationInfo.city || null,
        region: locationInfo.region || null,
        user_agent: userAgent,
        device_type: deviceInfo.device_type,
        browser: deviceInfo.browser,
        operating_system: deviceInfo.operating_system,
        referrer: referrer,
        session_id: finalSessionId, // Use guaranteed non-null sessionId
        user_id: user?.id || null,
        visited_at: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("[v0] Error inserting page view:", error)
      return NextResponse.json(
        {
          error: "Failed to track page view",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      pageViewId: data?.id,
      sessionId: finalSessionId, // Return the sessionId so client can use it
    })
  } catch (error) {
    console.error("[v0] Error in track-page-view API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
