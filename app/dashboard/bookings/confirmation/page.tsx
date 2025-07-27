"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BookingSuccess } from "@/components/animations/booking-success"
import { Button } from "@/components/ui/button"

export default function BookingConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("id")
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    // If no booking ID is provided, redirect to dashboard
    if (!bookingId) {
      router.push("/dashboard")
    }
  }, [bookingId, router])

  const handleViewBooking = () => {
    router.push(`/dashboard/bookings/${bookingId}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Booking Confirmed!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your booking has been successfully confirmed. Get ready for an amazing driving experience!
          </p>

          <div className="flex justify-center mb-8">
            <BookingSuccess onComplete={() => setAnimationComplete(true)} />
          </div>

          <div className="space-y-4">
            <Button onClick={handleViewBooking} className="w-full sm:w-auto">
              View Booking Details
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full sm:w-auto sm:ml-4">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
