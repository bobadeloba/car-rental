import { getSupabaseServer } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import RevenueChart from "@/components/admin/analytics/revenue-chart"
import BookingsChart from "@/components/admin/analytics/bookings-chart"
import PopularCarsChart from "@/components/admin/analytics/popular-cars-chart"
import AnalyticsSummary from "@/components/admin/analytics/analytics-summary"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata("Analytics | Admin Dashboard", "View analytics and insights for your car rental business")
}

export default async function AnalyticsPage() {
  const supabase = await getSupabaseServer()

  // Get total bookings
  const { data: bookings } = await supabase.from("bookings").select(`*, cars(*)`)

  // Get total revenue
  const { data: payments } = await supabase.from("payments").select("*").eq("payment_status", "completed")

  const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

  // Get total users
  const { data: users } = await supabase.from("users").select("*")

  // Get total cars
  const { data: cars } = await supabase.from("cars").select("*")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnalyticsSummary
        totalBookings={bookings?.length || 0}
        totalRevenue={totalRevenue}
        totalUsers={users?.length || 0}
        totalCars={cars?.length || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Monthly revenue from bookings</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <RevenueChart data={payments || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings by Status</CardTitle>
            <CardDescription>Monthly booking trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <BookingsChart data={bookings || []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most Popular Cars</CardTitle>
          <CardDescription>Cars with the most bookings</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] sm:h-[400px]">
          <PopularCarsChart data={bookings || []} />
        </CardContent>
      </Card>
    </div>
  )
}
