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

    const supabase = createServerClient()

    // Get user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get IP address
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ipAddress = forwarded?.split(",")[0] || realIp || "127.0.0.1"

    // Get user agent
    const userAgent = request.headers.get("user-agent") || ""

    // Detect device information
    const deviceInfo = detectDevice(userAgent)

    // Detect location
    const locationInfo = await detectLocation(ipAddress)

    // Get referrer
    const referrer = request.headers.get("referer") || ""

    // Insert page view
    const { data, error } = await supabase
      .from("page_views")
      .insert({
        page_path: pagePath,
        page_title: pageTitle,
        ip_address: ipAddress,
        country: locationInfo.country,
        city: locationInfo.city,
        region: locationInfo.region,
        user_agent: userAgent,
        device_type: deviceInfo.device_type,
        browser: deviceInfo.browser,
        operating_system: deviceInfo.operating_system,
        referrer: referrer,
        session_id: sessionId,
        user_id: user?.id || null,
        visited_at: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error inserting page view:", error)
      return NextResponse.json({ error: "Failed to track page view" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pageViewId: data?.id,
    })
  } catch (error) {
    console.error("Error in track-page-view API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
