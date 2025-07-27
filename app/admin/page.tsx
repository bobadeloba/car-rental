import { getSupabaseServer } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Users, Car, CalendarDays, DollarSign } from "lucide-react"
import { RecentBookings } from "@/components/admin/recent-bookings"
import { CarAvailability } from "@/components/admin/car-availability"
import { CarLoader } from "@/components/ui/car-loader"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata("Admin Dashboard", "Manage your car rental business")
}

export default async function AdminDashboardPage() {
  const supabase = await getSupabaseServer()
  const isLoading = !supabase

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <CarLoader size="lg" color="primary" />
        <p className="text-gray-500 animate-pulse">Loading admin dashboard...</p>
      </div>
    )
  }

  try {
    // Get total users
    const { count: userCount, error: userError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
    if (userError) throw userError

    // Get total cars
    const { count: carCount, error: carError } = await supabase.from("cars").select("*", { count: "exact", head: true })
    if (carError) throw carError

    // Get total bookings
    const { count: bookingCount, error: bookingError } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
    if (bookingError) throw bookingError

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from("bookings")
      .select("total_price")
      .eq("status", "completed")
    if (revenueError) throw revenueError

    const totalRevenue = revenueData?.reduce((sum, booking) => sum + booking.total_price, 0) || 0

    // Get recent bookings
    const { data: recentBookings, error: recentBookingsError } = await supabase
      .from("bookings")
      .select("*, users(full_name), cars(name, brand)")
      .order("created_at", { ascending: false })
      .limit(5)
    if (recentBookingsError) throw recentBookingsError

    // Get car availability - removed image_url since it doesn't exist
    const { data: cars, error: carsError } = await supabase
      .from("cars")
      .select("id, name, brand, availability_status")
      .order("name")
    if (carsError) throw carsError

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of Kings Rental Cars business metrics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCount || 0}</div>
              <p className="text-xs text-muted-foreground">Registered customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carCount || 0}</div>
              <p className="text-xs text-muted-foreground">Vehicles in fleet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingCount || 0}</div>
              <p className="text-xs text-muted-foreground">All-time reservations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">From completed bookings</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentBookings bookings={recentBookings || []} />
          <CarAvailability cars={cars || []} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return (
      <div className="p-4 sm:p-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
        <p>There was a problem loading the admin dashboard. Please try again later.</p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-sm">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        )}
      </div>
    )
  }
}
