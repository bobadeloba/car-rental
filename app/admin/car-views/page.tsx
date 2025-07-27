import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import CarViewsChart from "@/components/admin/analytics/car-views-chart"
import CarViewsTable from "@/components/admin/analytics/car-views-table"
import { CarViewsStats } from "@/components/admin/analytics/car-views-stats"
import { generatePageMetadata } from "@/lib/metadata"
import { createServerClient } from "@/lib/supabase/server"
import { Eye, TrendingUp, Car, Calendar } from "lucide-react"

export async function generateMetadata() {
  return generatePageMetadata("Car Views Analytics | Admin Dashboard", "Track and analyze car viewing statistics")
}

async function getCarViewsData() {
  try {
    const supabase = createServerClient({ admin: true })

    const { data: allViews, error: viewsError } = await supabase
      .from("car_views")
      .select("*")
      .order("viewed_at", { ascending: false })

    if (viewsError) {
      console.error("Error fetching car views:", viewsError)
      return {
        carViewStats: [],
        totalViews: 0,
        viewsChartData: [],
        todayViews: 0,
        weeklyGrowth: 0,
      }
    }

    const { data: cars, error: carsError } = await supabase.from("cars").select("id, name, brand, images")

    if (carsError) {
      console.error("Error fetching cars:", carsError)
      return {
        carViewStats: [],
        totalViews: allViews?.length || 0,
        viewsChartData: [],
        todayViews: 0,
        weeklyGrowth: 0,
      }
    }

    const carViewStats = processCarViewStats(cars || [], allViews || [])
    const viewsChartData = processViewsByDate(allViews || [])
    const todayViews = getTodayViews(allViews || [])
    const weeklyGrowth = getWeeklyGrowth(allViews || [])

    return {
      carViewStats,
      totalViews: allViews?.length || 0,
      viewsChartData,
      todayViews,
      weeklyGrowth,
    }
  } catch (error) {
    console.error("Error fetching car views data:", error)
    return {
      carViewStats: [],
      totalViews: 0,
      viewsChartData: [],
      todayViews: 0,
      weeklyGrowth: 0,
    }
  }
}

function processCarViewStats(cars: any[], views: any[]) {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  return cars
    .map((car) => {
      const carViews = views.filter((view) => view.car_id === car.id)
      const viewsLast7Days = carViews.filter((view) => new Date(view.viewed_at) >= sevenDaysAgo)
      const viewsLast30Days = carViews.filter((view) => new Date(view.viewed_at) >= thirtyDaysAgo)
      const lastViewedAt = carViews.length > 0 ? carViews[0].viewed_at : null

      const imageUrl = car.images && Array.isArray(car.images) && car.images.length > 0 ? car.images[0] : null

      return {
        id: car.id,
        name: car.name,
        brand: car.brand,
        image_url: imageUrl,
        total_views: carViews.length,
        views_last_7_days: viewsLast7Days.length,
        views_last_30_days: viewsLast30Days.length,
        last_viewed_at: lastViewedAt,
      }
    })
    .sort((a, b) => b.total_views - a.total_views)
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

function getTodayViews(views: { viewed_at: string }[]) {
  const today = new Date().toISOString().split("T")[0]
  return views.filter((view) => new Date(view.viewed_at).toISOString().split("T")[0] === today).length
}

function getWeeklyGrowth(views: { viewed_at: string }[]) {
  const now = new Date()
  const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const thisWeekViews = views.filter((view) => new Date(view.viewed_at) >= thisWeekStart).length
  const lastWeekViews = views.filter(
    (view) => new Date(view.viewed_at) >= lastWeekStart && new Date(view.viewed_at) < thisWeekStart,
  ).length

  if (lastWeekViews === 0) return thisWeekViews > 0 ? 100 : 0
  return Math.round(((thisWeekViews - lastWeekViews) / lastWeekViews) * 100)
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default async function CarViewsPage() {
  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Car Views Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track how often each car is viewed by visitors</p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <CarViewsContent />
      </Suspense>
    </div>
  )
}

async function CarViewsContent() {
  const { carViewStats, totalViews, viewsChartData, todayViews, weeklyGrowth } = await getCarViewsData()

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time car views</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Views</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayViews}</div>
            <p className="text-xs text-muted-foreground">Views today</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyGrowth > 0 ? "+" : ""}
              {weeklyGrowth}%
            </div>
            <p className="text-xs text-muted-foreground">vs last week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cars Tracked</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carViewStats.length}</div>
            <p className="text-xs text-muted-foreground">Cars with view data</p>
          </CardContent>
        </Card>
      </div>

      {/* Views Chart */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Views Over Time</CardTitle>
          <CardDescription>Daily car views for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] sm:h-[300px] lg:h-[400px]">
          <CarViewsChart data={viewsChartData} />
        </CardContent>
      </Card>

      {/* Car Views Table */}
      <div className="space-y-4">
        <CarViewsStats data={carViewStats} />
        <CarViewsTable data={carViewStats} />
      </div>
    </>
  )
}
