import { getSupabaseServer } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { differenceInDays, formatLongDate } from "@/lib/date-utils"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata("My Bookings", "View and manage your car rental bookings")
}

export default async function BookingsPage() {
  const supabase = await getSupabaseServer()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null // This should be handled by the layout
  }

  // Get all bookings for the user
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, cars(*)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Separate bookings by status
  const upcomingBookings =
    bookings?.filter((booking) => booking.status === "pending" || booking.status === "confirmed") || []

  const pastBookings =
    bookings?.filter((booking) => booking.status === "completed" || booking.status === "cancelled") || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your car rental bookings</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any upcoming bookings.</p>
                <Button asChild>
                  <Link href="/cars">Browse Cars</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastBookings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">You don't have any past bookings.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookingCard({ booking }: { booking: any }) {
  const startDate = new Date(booking.start_date)
  const endDate = new Date(booking.end_date)
  const durationDays = differenceInDays(endDate, startDate)

  const getCarUrl = (car: any) => {
    return car?.slug ? `/cars/${car.slug}` : `/cars/${car?.id}`
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative h-48 md:h-auto md:w-1/3 rounded-md overflow-hidden">
            <Image
              src={booking.cars?.images?.[0] || "/placeholder.svg?height=400&width=600&query=car"}
              alt={booking.cars?.name || "Car"}
              fill
              className="object-cover"
            />
            <div
              className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${
                booking.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : booking.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : booking.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
              }`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">
                  {booking.cars?.brand || "Unknown"} {booking.cars?.name || "Car"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">Booking #{booking.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="mt-2 md:mt-0 text-right">
                <p className="text-xl font-bold text-primary">{formatCurrency(booking.total_price)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total for {durationDays} days</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pickup Date</p>
                <p className="font-medium">{formatLongDate(startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Return Date</p>
                <p className="font-medium">{formatLongDate(endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Booking Date</p>
                <p className="font-medium">{formatLongDate(booking.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-medium">{durationDays} days</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href={`/dashboard/bookings/${booking.id}`}>View Details</Link>
              </Button>
              {booking.status === "pending" && (
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/bookings/${booking.id}/edit`}>Modify Booking</Link>
                </Button>
              )}
              {(booking.status === "completed" || booking.status === "cancelled") && booking.cars?.id && (
                <Button variant="outline" asChild>
                  <Link href={getCarUrl(booking.cars)}>Book Again</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
