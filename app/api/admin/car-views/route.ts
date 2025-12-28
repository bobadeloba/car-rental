import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Create admin Supabase client
    const supabase = createAdminClient()

    // Get car view statistics
    const { data: carViewStats, error } = await supabase
      .from("car_view_stats")
      .select("*")
      .order("total_views", { ascending: false })

    if (error) {
      console.error("Error fetching car view stats:", error)
      return NextResponse.json({ error: "Failed to fetch car view statistics" }, { status: 500 })
    }

    // Get total views across all cars
    const { data: totalViewsData, error: totalError } = await supabase
      .from("car_views")
      .select("id", { count: "exact" })

    if (totalError) {
      console.error("Error fetching total views:", totalError)
      return NextResponse.json({ error: "Failed to fetch total views" }, { status: 500 })
    }

    // Get views by date for the last 30 days
    const { data: viewsByDate, error: dateError } = await supabase
      .from("car_views")
      .select("viewed_at")
      .gte("viewed_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("viewed_at", { ascending: true })

    if (dateError) {
      console.error("Error fetching views by date:", dateError)
      return NextResponse.json({ error: "Failed to fetch views by date" }, { status: 500 })
    }

    // Process views by date for chart data
    const viewsChartData = processViewsByDate(viewsByDate || [])

    return NextResponse.json({
      carViewStats: carViewStats || [],
      totalViews: totalViewsData?.length || 0,
      viewsChartData,
    })
  } catch (error) {
    console.error("Error in car-views API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function processViewsByDate(views: { viewed_at: string }[]) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split("T")[0]
  })

  const viewCounts = views.reduce(
    (acc, view) => {
      const date = new Date(view.viewed_at).toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return last30Days.map((date) => ({
    date,
    views: viewCounts[date] || 0,
  }))
}
