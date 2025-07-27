import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { carId } = await request.json()

    if (!carId) {
      return NextResponse.json({ error: "Car ID is required" }, { status: 400 })
    }

    // Get client IP and user agent
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")

    // Extract IP address and validate it
    let ipAddress: string | null = null

    if (forwarded) {
      const firstIp = forwarded.split(",")[0].trim()
      // Basic IP validation (IPv4 or IPv6)
      if (isValidIpAddress(firstIp)) {
        ipAddress = firstIp
      }
    } else if (realIp && isValidIpAddress(realIp)) {
      ipAddress = realIp
    }

    // If no valid IP found, use null (which PostgreSQL will accept)
    const userAgent = request.headers.get("user-agent") || null

    // Create Supabase client (no admin needed for inserting views)
    const supabase = createServerClient()

    // Insert the view record
    const { error } = await supabase.from("car_views").insert({
      car_id: carId,
      ip_address: ipAddress, // This will be null if no valid IP found
      user_agent: userAgent,
    })

    if (error) {
      console.error("Error tracking car view:", error)
      return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in track-car-view API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to validate IP addresses
function isValidIpAddress(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/

  // Check for localhost variations
  if (ip === "localhost" || ip === "127.0.0.1" || ip === "::1") {
    return true
  }

  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}
