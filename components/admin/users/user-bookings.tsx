"use client"

import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface Booking {
  id: string
  start_date: string
  end_date: string
  total_price: number
  status: string
  created_at: string
  cars: {
    id: string
    name: string
    brand: string
    images: string[]
  }
}

interface UserBookingsProps {
  bookings: Booking[]
  userId: string
}

export default function UserBookings({ bookings, userId }: UserBookingsProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {bookings.length > 0 ? (
        <>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="relative h-24 md:h-auto md:w-32 rounded-md overflow-hidden">
                <Image
                  src={booking.cars.images[0] || "/placeholder.svg?height=200&width=300"}
                  alt={booking.cars.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-medium">
                      {booking.cars.brand} {booking.cars.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Booking #{booking.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 md:text-right">
                    <p className="font-medium text-primary">{formatCurrency(booking.total_price)}</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(
                        booking.status,
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dates</p>
                    <p className="text-sm">
                      {format(new Date(booking.start_date), "MMM d")} -{" "}
                      {format(new Date(booking.end_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Booked On</p>
                    <p className="text-sm">{format(new Date(booking.created_at), "MMM d, yyyy")}</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button size="sm" asChild>
                    <Link href={`/admin/bookings/${booking.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-4">
            <Button variant="outline" asChild>
              <Link href={`/admin/bookings?user=${userId}`}>View All Bookings</Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">This user has no bookings yet.</p>
        </div>
      )}
    </div>
  )
}
