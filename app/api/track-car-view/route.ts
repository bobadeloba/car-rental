import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { detectDevice } from "@/lib/device-detector"
import { detectLocation } from "@/lib/location-detector"

export async function POST(request: NextRequest) {
  try {
    const { carId, sessionId } = await request.json()

    if (!carId) {
      return NextResponse.json({ error: "Car ID is required" }, { status: 400 })
    }

    const finalSessionId = sessionId || `server-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    // Get client IP and user agent
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ipAddress = forwarded?.split(",")[0]?.trim() || realIp || null
    const userAgent = request.headers.get("user-agent") || ""

    // Detect device info
    const deviceInfo = detectDevice(userAgent)

    // Detect location
    const locationInfo = await detectLocation(ipAddress || "")

    const supabase = await createServerClient()

    // Get user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Insert the view record with all available data
    const { error } = await supabase.from("car_views").insert({
      car_id: carId,
      ip_address: ipAddress,
      user_agent: userAgent,
      session_id: finalSessionId,
      user_id: user?.id || null,
      device_type: deviceInfo.device_type,
      browser: deviceInfo.browser,
      operating_system: deviceInfo.operating_system,
      country: locationInfo.country || null,
      city: locationInfo.city || null,
      region: locationInfo.region || null,
      viewed_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Error tracking car view:", error)
      return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in track-car-view API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
