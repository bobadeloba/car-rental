import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, differenceInDays } from "date-fns"
import { CalendarDays, Car } from "lucide-react"

interface BookingSummaryProps {
  booking: any
}

export default function BookingSummary({ booking }: BookingSummaryProps) {
  const startDate = new Date(booking.start_date)
  const endDate = new Date(booking.end_date)
  const days = differenceInDays(endDate, startDate) + 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-md">
            {booking.cars?.images?.[0] ? (
              <Image
                src={booking.cars.images[0] || "/placeholder.svg"}
                alt={booking.cars.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                <Car className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium">
              {booking.cars?.brand} {booking.cars?.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">${booking.cars?.price_per_day} per day</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <CalendarDays className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Pickup Date</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{format(startDate, "EEEE, MMMM d, yyyy")}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Return Date</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{format(endDate, "EEEE, MMMM d, yyyy")}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm">Duration</span>
            <span>{days} days</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm">Price per day</span>
            <span>${booking.cars?.price_per_day}</span>
          </div>
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>${booking.total_price}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
