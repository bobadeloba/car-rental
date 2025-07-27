"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { getSupabaseClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/date-utils"
import { CarSpinner } from "@/components/ui/car-spinner"

interface Booking {
  id: string
  start_date: string
  end_date: string
  total_price: number
  status: string
  cars: {
    id: string
    name: string
    brand: string
    images: string[]
  }
}

interface UpcomingBookingsProps {
  userId: string
}

export default function UpcomingBookings({ userId }: UpcomingBookingsProps) {
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true)
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
          .from("bookings")
          .select("*, cars(*)")
          .eq("user_id", userId)
          .gte("start_date", new Date().toISOString())
          .order("start_date", { ascending: true })
          .limit(3)

        if (error) {
          throw error
        }

        setBookings(data)
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load upcoming bookings")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchBookings()
    }
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="flex flex-col items-center space-y-2">
            <CarSpinner />
            <p className="text-sm text-gray-500">Loading your bookings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/cars">Browse Cars</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings && bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-start space-x-4">
                <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={booking.cars?.images?.[0] || "/placeholder.svg?height=200&width=300&query=car"}
                    alt={booking.cars?.name || "Car"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {booking.cars?.brand || "Unknown"} {booking.cars?.name || "Car"}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                    </span>
                    <span className="mx-1">•</span>
                    <span className="capitalize">{booking.status}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">{formatCurrency(booking.total_price)}</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/bookings/${booking.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any upcoming bookings.</p>
            <Button asChild>
              <Link href="/cars">Browse Cars</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
