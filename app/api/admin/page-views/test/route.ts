import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return sample data for testing
    const sampleData = {
      pageStats: [
        {
          page_path: "/",
          page_title: "Home",
          total_views: 1250,
          unique_visitors: 890,
          views_today: 45,
          views_last_7_days: 320,
          views_last_30_days: 1100,
          last_visited_at: new Date().toISOString(),
        },
        {
          page_path: "/cars",
          page_title: "Cars",
          total_views: 980,
          unique_visitors: 650,
          views_today: 32,
          views_last_7_days: 245,
          views_last_30_days: 850,
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
          visited_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
      ],
    }

    return NextResponse.json(sampleData)
  } catch (error) {
    console.error("Error in test API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
