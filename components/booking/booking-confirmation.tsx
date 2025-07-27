"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BookingSuccess } from "@/components/animations/booking-success"
import { KeyFob } from "@/components/animations/key-fob"
import Link from "next/link"
import { Calendar, Clock, MapPin } from "lucide-react"

interface BookingConfirmationProps {
  bookingId: string
  carName: string
  startDate: string
  endDate: string
  location?: string
  totalPrice: number
}

export function BookingConfirmation({
  bookingId,
  carName,
  startDate,
  endDate,
  location,
  totalPrice,
}: BookingConfirmationProps) {
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-center mb-6">{!animationComplete ? <BookingSuccess /> : <KeyFob />}</div>

      <h2 className="text-2xl font-bold text-center mb-2">Booking Confirmed!</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Your {carName} is ready for pickup</p>

      <div className="space-y-4 mb-6">
        <div className="flex items-start">
          <div className="bg-primary/10 p-2 rounded-full mr-4">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Rental Period</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {location && (
          <div className="flex items-start">
            <div className="bg-primary/10 p-2 rounded-full mr-4">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Pickup Location</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{location}</p>
            </div>
          </div>
        )}

        <div className="flex items-start">
          <div className="bg-primary/10 p-2 rounded-full mr-4">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Booking Reference</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">#{bookingId.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col space-y-3">
        <Button asChild>
          <Link href="/dashboard/bookings">View My Bookings</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}
