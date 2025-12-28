import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin by querying the users table
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError || userData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    console.log("[v0] Fetching page analytics data from database...")

    // Fetch page statistics from the view
    const { data: pageStats, error: pageError } = await supabase
      .from("page_view_stats")
      .select("*")
      .order("total_views", { ascending: false })

    if (pageError) {
      console.error("[v0] Error fetching page stats:", pageError)
    }

    // Fetch location statistics from the view
    const { data: locationStats, error: locationError } = await supabase
      .from("page_view_locations")
      .select("*")
      .order("total_views", { ascending: false })
      .limit(50)

    if (locationError) {
      console.error("[v0] Error fetching location stats:", locationError)
    }

    // Fetch device statistics from the view
    const { data: deviceStats, error: deviceError } = await supabase
      .from("page_view_devices")
      .select("*")
      .order("total_views", { ascending: false })
      .limit(50)

    if (deviceError) {
      console.error("[v0] Error fetching device stats:", deviceError)
    }

    // Fetch recent page views with duration
    const { data: recentViews, error: recentError } = await supabase
      .from("page_views")
      .select(
        `
        id,
        page_path,
        page_title,
        country,
        city,
        device_type,
        browser,
        duration_seconds,
        is_bounce,
        exit_type,
        visited_at
      `,
      )
      .order("visited_at", { ascending: false })
      .limit(100)

    if (recentError) {
      console.error("[v0] Error fetching recent views:", recentError)
    }

    console.log("[v0] Page analytics data fetched successfully:", {
      pageStats: pageStats?.length || 0,
      locationStats: locationStats?.length || 0,
      deviceStats: deviceStats?.length || 0,
      recentViews: recentViews?.length || 0,
    })

    // Return real data, use empty arrays if no data available
    return NextResponse.json({
      pageStats: pageStats || [],
      locationStats: locationStats || [],
      deviceStats: deviceStats || [],
      recentViews: recentViews || [],
      engagementStats: [],
    })
  } catch (error) {
    console.error("[v0] Error in page-views API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getSampleData() {
  return {
    pageStats: [
      {
        page_path: "/",
        page_title: "Home",
        total_views: 1250,
        unique_visitors: 890,
        views_today: 45,
        views_last_7_days: 320,
        views_last_30_days: 1100,
        avg_duration_seconds: 125,
        avg_duration_minutes: 2.08,
        bounce_count: 180,
        bounce_rate_percentage: 14.4,
        engaged_sessions: 950,
        engagement_rate_percentage: 76.0,
        last_visited_at: new Date().toISOString(),
      },
      {
        page_path: "/cars",
        page_title: "Cars",
        total_views: 890,
        unique_visitors: 650,
        views_today: 32,
        views_last_7_days: 210,
        views_last_30_days: 780,
        avg_duration_seconds: 95,
        avg_duration_minutes: 1.58,
        bounce_count: 120,
        bounce_rate_percentage: 13.5,
        engaged_sessions: 680,
        engagement_rate_percentage: 76.4,
        last_visited_at: new Date().toISOString(),
      },
      {
        page_path: "/about",
        page_title: "About",
        total_views: 420,
        unique_visitors: 310,
        views_today: 12,
        views_last_7_days: 85,
        views_last_30_days: 380,
        avg_duration_seconds: 180,
        avg_duration_minutes: 3.0,
        bounce_count: 45,
        bounce_rate_percentage: 10.7,
        engaged_sessions: 350,
        engagement_rate_percentage: 83.3,
        last_visited_at: new Date().toISOString(),
      },
    ],
    locationStats: [
      {
        country: "United States",
        city: "New York",
        region: "NY",
        total_views: 450,
        unique_visitors: 320,
        views_last_7_days: 85,
      },
      {
        country: "United Kingdom",
        city: "London",
        region: "England",
        total_views: 380,
        unique_visitors: 250,
        views_last_7_days: 72,
      },
      {
        country: "Canada",
        city: "Toronto",
        region: "ON",
        total_views: 290,
        unique_visitors: 180,
        views_last_7_days: 55,
      },
    ],
    deviceStats: [
      {
        device_type: "desktop",
        browser: "Chrome",
        operating_system: "Windows",
        total_views: 850,
        unique_visitors: 580,
        views_last_7_days: 165,
      },
      {
        device_type: "mobile",
        browser: "Safari",
        operating_system: "iOS",
        total_views: 620,
        unique_visitors: 420,
        views_last_7_days: 125,
      },
      {
        device_type: "mobile",
        browser: "Chrome",
        operating_system: "Android",
        total_views: 480,
        unique_visitors: 320,
        views_last_7_days: 95,
      },
    ],
    recentViews: [
      {
        id: "1",
        page_path: "/",
        page_title: "Home",
        country: "United States",
        city: "New York",
        device_type: "desktop",
        browser: "Chrome",
        duration_seconds: 145,
        is_bounce: false,
        exit_type: "navigation",
        visited_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        page_path: "/cars",
        page_title: "Cars",
        country: "United Kingdom",
        city: "London",
        device_type: "mobile",
        browser: "Safari",
        duration_seconds: 89,
        is_bounce: false,
        exit_type: "navigation",
        visited_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        page_path: "/about",
        page_title: "About",
        country: "Canada",
        city: "Toronto",
        device_type: "desktop",
        browser: "Firefox",
        duration_seconds: 234,
        is_bounce: false,
        exit_type: "close",
        visited_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
    ],
    engagementStats: [
      {
        page_path: "/",
        page_title: "Home",
        total_sessions: 1250,
        avg_duration: 125,
        median_duration: 98,
        max_duration: 1200,
        quick_exits: 50,
        short_visits: 200,
        medium_visits: 600,
        long_visits: 300,
        very_long_visits: 100,
        exit_type: "navigation",
        exit_count: 800,
      },
    ],
  }
}
