import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format, differenceInDays } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Car, MapPin, Clock, CheckCircle, AlertCircle, InfoIcon } from "lucide-react"
import CancelBookingButton from "@/components/dashboard/cancel-booking-button"
import PaymentButton from "@/components/dashboard/payment-button"
import { getCompanyName } from "@/lib/company-name"
import type { Metadata, ResolvingMetadata } from "next"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const companyName = await getCompanyName()

  return {
    title: `Booking Details | ${companyName}`,
    description: `View your booking details and manage your reservation`,
  }
}

export default async function BookingDetailsPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin?redirect=/dashboard/bookings/" + params.id)
  }

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      pickup_location,
      cars:car_id (
        id,
        name,
        brand,
        price_per_day,
        images,
        specs
      )
    `)
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single()

  if (!booking) {
    notFound()
  }

  // Get payment status
  const { data: payment } = await supabase.from("payments").select("*").eq("booking_id", params.id).maybeSingle()

  const startDate = new Date(booking.start_date)
  const endDate = new Date(booking.end_date)
  const days = differenceInDays(endDate, startDate) + 1

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Confirmed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-600 dark:text-gray-400">Booking #{params.id.slice(0, 8)}</p>
            {getStatusBadge(booking.status)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {booking.status === "pending" && !payment && <PaymentButton />}

          {booking.status !== "cancelled" && <CancelBookingButton bookingId={params.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative h-48 md:h-auto md:w-64 rounded-md overflow-hidden">
                  {booking.cars?.images?.[0] ? (
                    <Image
                      src={booking.cars.images[0] || "/placeholder.svg"}
                      alt={booking.cars.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <Car className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {booking.cars?.brand} {booking.cars?.name}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {booking.cars?.specs && (
                      <>
                        {Object.entries(booking.cars.specs)
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="text-sm font-medium capitalize">{key.replace("_", " ")}:</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{String(value)}</span>
                            </div>
                          ))}
                      </>
                    )}
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/cars/${booking.cars?.id}`}>View Car Details</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Pickup Date</p>
                      <p className="text-gray-600 dark:text-gray-400">{format(startDate, "EEEE, MMMM d, yyyy")}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Return Date</p>
                      <p className="text-gray-600 dark:text-gray-400">{format(endDate, "EEEE, MMMM d, yyyy")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Pickup & Return Location</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {booking.pickup_location || "Pickup location not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              {payment ? (
                <CardDescription>
                  {payment.payment_status === "completed" ? "Payment completed" : "Payment pending"}
                </CardDescription>
              ) : (
                <CardDescription>Payment required to confirm booking</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-md">
                <div className="flex items-center gap-2">
                  <InfoIcon className="h-5 w-5" />
                  <p className="font-medium">Payment system coming soon</p>
                </div>
                <p className="mt-2 text-sm">
                  We're currently working on integrating our payment system. Thank you for your patience.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If you need assistance with your booking, please contact our customer support team.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
