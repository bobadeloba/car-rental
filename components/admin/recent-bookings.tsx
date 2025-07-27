import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/admin/status-badge"
import { formatDistanceToNow } from "@/lib/date-utils"

interface Booking {
  id: string
  start_date: string
  end_date: string
  status: string
  total_price: number
  created_at: string
  users?: {
    full_name: string
    avatar_url?: string | null
  }
  cars?: {
    name: string
    brand: string
    image_url?: string | null
  }
  // Keep the old structure as optional for backward compatibility
  profiles?: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

interface RecentBookingsProps {
  bookings: Booking[]
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Bookings</CardTitle>
        <Link href="/admin/bookings" className="text-sm text-blue-500 hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-center text-muted-foreground">No recent bookings</p>
          ) : (
            bookings.map((booking) => {
              // Handle both data structures
              const userName =
                booking.users?.full_name ||
                (booking.profiles ? `${booking.profiles.first_name} ${booking.profiles.last_name}` : "Unknown User")

              const userInitials = booking.users?.full_name
                ? booking.users.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : booking.profiles
                  ? `${booking.profiles.first_name[0]}${booking.profiles.last_name[0]}`
                  : "U"

              const avatarUrl = booking.users?.avatar_url || booking.profiles?.avatar_url || ""

              const carName = booking.cars ? `${booking.cars.brand} ${booking.cars.name}` : "Unknown Car"

              return (
                <div
                  key={booking.id}
                  className="flex flex-col items-start space-y-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={userName} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <p className="truncate font-medium">{userName}</p>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-muted-foreground">{carName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="mt-2 w-full rounded-md bg-primary px-3 py-1 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:mt-0 sm:w-auto"
                  >
                    View Details
                  </Link>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
