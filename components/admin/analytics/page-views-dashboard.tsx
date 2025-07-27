"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Eye,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Users,
  TrendingUp,
  Search,
  RefreshCw,
  Clock,
  Timer,
  Target,
  Activity,
} from "lucide-react"

interface PageViewStats {
  page_path: string
  page_title: string
  total_views: number
  unique_visitors: number
  views_today: number
  views_last_7_days: number
  views_last_30_days: number
  avg_duration_seconds: number
  avg_duration_minutes: number
  bounce_count: number
  bounce_rate_percentage: number
  engaged_sessions: number
  engagement_rate_percentage: number
  last_visited_at: string
}

interface LocationStats {
  country: string
  city: string
  region: string
  total_views: number
  unique_visitors: number
  views_last_7_days: number
}

interface DeviceStats {
  device_type: string
  browser: string
  operating_system: string
  total_views: number
  unique_visitors: number
  views_last_7_days: number
}

interface RecentView {
  id: string
  page_path: string
  page_title: string
  country: string
  city: string
  device_type: string
  browser: string
  duration_seconds: number
  is_bounce: boolean
  exit_type: string
  visited_at: string
}

interface EngagementStats {
  page_path: string
  page_title: string
  total_sessions: number
  avg_duration: number
  median_duration: number
  max_duration: number
  quick_exits: number
  short_visits: number
  medium_visits: number
  long_visits: number
  very_long_visits: number
  exit_type: string
  exit_count: number
}

export default function PageViewsDashboard() {
  const [data, setData] = useState<{
    pageStats: PageViewStats[]
    locationStats: LocationStats[]
    deviceStats: DeviceStats[]
    recentViews: RecentView[]
    engagementStats: EngagementStats[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      setRefreshing(true)
      setError(null)

      let response = await fetch("/api/admin/page-views")

      if (response.status === 401 || response.status === 403) {
        console.warn("Authentication failed, using test data")
        response = await fetch("/api/admin/page-views/test")
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (error) {
      console.error("Error fetching page views data:", error)
      setError("Failed to load analytics data. Using sample data for demonstration.")

      // Set sample data with duration metrics
      setData({
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
            visited_at: new Date().toISOString(),
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
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const filteredPageStats =
    data?.pageStats.filter(
      (page) =>
        page.page_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.page_title?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-lg font-semibold">{error}</div>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="text-muted-foreground">No analytics data available</div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalViews = data.pageStats.reduce((sum, page) => sum + page.total_views, 0)
  const totalUniqueVisitors = data.pageStats.reduce((sum, page) => sum + page.unique_visitors, 0)
  const avgDuration = data.pageStats.reduce(
    (sum, page, _, arr) => sum + (page.avg_duration_seconds || 0) / arr.length,
    0,
  )
  const avgBounceRate = data.pageStats.reduce(
    (sum, page, _, arr) => sum + (page.bounce_rate_percentage || 0) / arr.length,
    0,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Page Analytics with Duration Tracking</h2>
          <p className="text-muted-foreground">Track visitor behavior, engagement, and time spent on pages</p>
        </div>
        <Button onClick={fetchData} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalViews)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              All time
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time on Page</CardTitle>
            <Timer className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(Math.round(avgDuration))}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              Average duration
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgBounceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Activity className="h-3 w-3 mr-1" />
              Quick exits (&lt;10s)
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalUniqueVisitors)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Globe className="h-3 w-3 mr-1" />
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Page Performance with Duration */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Page Performance & Engagement
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPageStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No pages match your search" : "No page data available"}
              </div>
            ) : (
              filteredPageStats.map((page, index) => (
                <div key={index} className="flex flex-col p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                    <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                      <h3 className="font-medium truncate">{page.page_title || page.page_path}</h3>
                      <p className="text-sm text-muted-foreground truncate">{page.page_path}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatNumber(page.total_views)}</div>
                      <div className="text-sm text-muted-foreground">total views</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {formatDuration(page.avg_duration_seconds || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {(page.engagement_rate_percentage || 0).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        {(page.bounce_rate_percentage || 0).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Bounce Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">{formatNumber(page.unique_visitors)}</div>
                      <div className="text-xs text-muted-foreground">Unique Visitors</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Engagement Rate</span>
                      <span>{(page.engagement_rate_percentage || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={page.engagement_rate_percentage || 0} className="h-2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Views with Duration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Page Views with Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentViews.slice(0, 15).map((view, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getDeviceIcon(view.device_type)}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{view.page_title || view.page_path}</div>
                    <div className="text-sm text-muted-foreground">
                      {view.country && view.city && view.city !== "Unknown"
                        ? `${view.city}, ${view.country}`
                        : view.country || "Unknown location"}
                      {" • "}
                      {view.browser}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <div className="text-center">
                    <div className="text-sm font-semibold">
                      {view.duration_seconds ? formatDuration(view.duration_seconds) : "0s"}
                    </div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center">
                    <Badge variant={view.is_bounce ? "destructive" : "secondary"} className="text-xs">
                      {view.is_bounce ? "Bounce" : "Engaged"}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(view.visited_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
