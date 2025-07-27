import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UpcomingBookings from "@/components/dashboard/upcoming-bookings"
import RecentActivity from "@/components/dashboard/recent-activity"
import { KeyFob } from "@/components/animations/key-fob"
import { CarLoader } from "@/components/ui/car-loader"
import { generatePageMetadata } from "@/lib/metadata"

// Use generateMetadata instead of static metadata
export async function generateMetadata() {
  return generatePageMetadata("Dashboard", "Manage your car rentals and bookings")
}

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = getSupabaseServer()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard")
  }

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (userError) {
    console.error("Error fetching user data:", userError)
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <CarLoader size="lg" />
        <p className="text-gray-500 animate-pulse">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userData?.full_name || "User"}</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your car rentals and bookings</p>
        </div>
        <KeyFob className="hidden md:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Pass userId to UpcomingBookings instead of bookings array */}
          <UpcomingBookings userId={session.user.id} />

          {/* Pass userId to RecentActivity instead of notifications array */}
          <RecentActivity userId={session.user.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p>{userData?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <p>{userData?.phone_number || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loyalty Points</p>
                  <p>{userData?.loyalty_points || 0} points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
