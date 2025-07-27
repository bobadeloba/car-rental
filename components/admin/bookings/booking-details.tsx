import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { differenceInDays } from "date-fns"
import Image from "next/image"
import Link from "next/link"

interface BookingDetailsProps {
  booking: any
  payment?: any
}

export default function BookingDetails({ booking, payment }: BookingDetailsProps) {
  const rentalDuration = differenceInDays(new Date(booking.end_date), new Date(booking.start_date))

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const getPaymentStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"

    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "refunded":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getCarImage = () => {
    if (booking.cars?.images && booking.cars.images.length > 0) {
      return booking.cars.images[0]
    }
    return "/placeholder.svg"
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Booking #{booking.id.slice(0, 8).toUpperCase()}</CardTitle>
              <CardDescription>Created on {formatDate(booking.created_at)}</CardDescription>
            </div>
            <Badge className={`${getStatusColor(booking.status)} capitalize`}>{booking.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Rental Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Start Date</span>
                  <span className="text-sm font-medium">{formatDate(booking.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">End Date</span>
                  <span className="text-sm font-medium">{formatDate(booking.end_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Duration</span>
                  <span className="text-sm font-medium">{rentalDuration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pickup Location</span>
                  <span className="text-sm font-medium">{booking.pickup_location || "Main Office"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Return Location</span>
                  <span className="text-sm font-medium">{booking.return_location || "Main Office"}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Daily Rate</span>
                  <span className="text-sm font-medium">{formatCurrency(booking.cars.price_per_day)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Days</span>
                  <span className="text-sm font-medium">{rentalDuration}</span>
                </div>
                {booking.extras_price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Extras</span>
                    <span className="text-sm font-medium">{formatCurrency(booking.extras_price || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-sm font-medium">Total Price</span>
                  <span className="text-sm font-bold">{formatCurrency(booking.total_price)}</span>
                </div>
                <div className="flex justify-between mt-4">
                  <span className="text-sm">Payment Status</span>
                  {payment && payment.status ? (
                    <Badge className={`${getPaymentStatusColor(payment.status)} capitalize`}>{payment.status}</Badge>
                  ) : (
                    <Badge variant="outline">No payment record</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {booking.users?.avatar_url ? (
                <Image
                  src={booking.users.avatar_url || "/placeholder.svg"}
                  alt={booking.users?.full_name || "User"}
                  width={60}
                  height={60}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-[60px] h-[60px] rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-600">
                    {booking.users?.full_name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium">
                  <Link href={`/admin/users/${booking.user_id}`} className="hover:underline">
                    {booking.users?.full_name || "Unknown User"}
                  </Link>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{booking.users?.email || "No email"}</p>
                {booking.users?.phone_number && <p className="text-sm">{booking.users.phone_number}</p>}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href={`/admin/users/${booking.user_id}`} className="text-sm text-primary hover:underline">
                View Customer Profile
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {booking.cars?.images && booking.cars.images.length > 0 ? (
                <Image
                  src={getCarImage() || "/placeholder.svg"}
                  alt={`${booking.cars?.brand || "Unknown"} ${booking.cars?.name || "Car"}`}
                  width={80}
                  height={60}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="w-[80px] h-[60px] rounded-md bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">No Image</span>
                </div>
              )}
              <div>
                <h3 className="font-medium">
                  <Link href={`/admin/cars/${booking.car_id}`} className="hover:underline">
                    {booking.cars?.brand || "Unknown"} {booking.cars?.name || "Car"}
                  </Link>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {booking.cars?.category || "Unknown Category"}
                </p>
                <p className="text-sm">{formatCurrency(booking.cars?.price_per_day || 0)} / day</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href={`/admin/cars/${booking.car_id}`} className="text-sm text-primary hover:underline">
                View Vehicle Details
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {booking.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{booking.notes}</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}
