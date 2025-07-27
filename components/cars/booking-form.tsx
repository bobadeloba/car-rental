"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatCurrency } from "@/lib/utils"
import { getSupabaseClient } from "@/lib/supabase/client"
import { formatPPP } from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookingSuccess } from "@/components/animations/booking-success"

interface BookingFormProps {
  carId: string
  pricePerDay: number
  existingBookings?: Array<{
    id: string
    start_date: string
    end_date: string
  }>
}

interface Booking {
  id: string
  start_date: string
  end_date: string
}

export default function BookingForm({ carId, pricePerDay, existingBookings: propBookings }: BookingFormProps) {
  const router = useRouter()
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [existingBookings, setExistingBookings] = useState<Booking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [bookingConfirmation, setBookingConfirmation] = useState<{ id: string } | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null)

  // Fetch existing bookings for this car
  useEffect(() => {
    const fetchBookings = async () => {
      if (!carId) return

      try {
        setIsLoadingBookings(true)
        setError(null)

        // If bookings are passed as props, use them directly
        if (propBookings && propBookings.length > 0) {
          setExistingBookings(propBookings)
          setIsLoadingBookings(false)
          return
        }

        // Otherwise fetch from database
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
          .from("bookings")
          .select("id, start_date, end_date")
          .eq("car_id", carId)
          .in("status", ["confirmed", "pending"])

        if (error) throw error

        setExistingBookings(data || [])
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load availability. Please try again later.")

        // Retry logic for mobile connections
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
            fetchBookings()
          }, 2000) // Retry after 2 seconds
        }
      } finally {
        setIsLoadingBookings(false)
      }
    }

    fetchBookings()

    // Clear any existing timeout when component unmounts or carId changes
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    }
  }, [carId, propBookings, retryCount])

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    if (isLoadingBookings) {
      const timeout = setTimeout(() => {
        if (isLoadingBookings) {
          setIsLoadingBookings(false)
          setError("Loading availability timed out. Please refresh the page.")
        }
      }, 10000) // 10 seconds timeout

      setLoadingTimeout(timeout)
      return () => clearTimeout(timeout)
    }
  }, [isLoadingBookings])

  // Check if a date is unavailable (already booked)
  const isDateUnavailable = useCallback(
    (date: Date) => {
      if (!date || !(date instanceof Date)) return false

      // Convert to midnight for consistent comparison
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)

      return existingBookings.some((booking) => {
        const bookingStart = new Date(booking.start_date)
        const bookingEnd = new Date(booking.end_date)

        bookingStart.setHours(0, 0, 0, 0)
        bookingEnd.setHours(0, 0, 0, 0)

        // Check if date falls within a booking period
        return targetDate >= bookingStart && targetDate <= bookingEnd
      })
    },
    [existingBookings],
  )

  // Calculate total price when dates change
  useEffect(() => {
    if (startDate && endDate) {
      try {
        // Ensure we're calculating days correctly
        const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        const calculatedPrice = days * pricePerDay

        // Validate the calculated price is a number
        if (isNaN(calculatedPrice)) {
          console.error("Price calculation resulted in NaN", { days, pricePerDay })
          setTotalPrice(0)
        } else {
          setTotalPrice(calculatedPrice)
        }
      } catch (err) {
        console.error("Error calculating price:", err)
        setTotalPrice(0)
      }
    } else {
      setTotalPrice(0)
    }
  }, [startDate, endDate, pricePerDay])

  // Handle start date selection with consideration of unavailable dates
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date)
    if (date && endDate && date > endDate) {
      setEndDate(undefined)
    }
  }

  // Handle end date selection
  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date)
  }

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setError("Please select both pickup and return dates")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const supabase = getSupabaseClient()

      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/signin?callbackUrl=/cars/" + carId)
        return
      }

      // Calculate rental duration and total price
      const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
      const totalAmount = days * pricePerDay

      // Validate the calculated price
      if (isNaN(totalAmount)) {
        throw new Error("Invalid price calculation")
      }

      // Create booking
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          car_id: carId,
          user_id: session.user.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_price: totalAmount,
          status: "pending",
        })
        .select()

      if (error) throw error

      // Show success animation before redirecting
      setShowSuccess(true)
      setBookingConfirmation(data && data.length > 0 ? { id: data[0].id } : null)

      // Redirect after animation completes
      setTimeout(() => {
        router.push(`/dashboard/bookings/${data[0].id}`)
      }, 3000)
    } catch (err) {
      console.error("Booking error:", err)
      setError("Failed to create booking. Please try again.")
      setIsLoading(false)
    }
  }

  // Use a simpler approach for marking unavailable dates
  const modifiers = {
    unavailable: (date: Date) => isDateUnavailable(date),
  }

  const modifiersStyles = {
    unavailable: {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      color: "rgb(239, 68, 68)",
      textDecoration: "line-through",
    },
  }

  // Format price safely to prevent NaN display
  const safeFormatCurrency = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) {
      return "$0.00"
    }
    return formatCurrency(value)
  }

  // Calculate days safely
  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    try {
      return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    } catch (e) {
      return 0
    }
  }

  return (
    <div>
      <div className="space-y-4">
        {isLoadingBookings ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading availability...</span>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Pickup Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-gray-500")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? formatPPP(startDate) : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateSelect}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today || isDateUnavailable(date)
                    }}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                  />
                  <div className="p-3 border-t border-border">
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded-sm mr-2"></div>
                      <span>Unavailable - Already booked</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Return Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-gray-500")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? formatPPP(endDate) : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateSelect}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today || (startDate ? date < startDate : false) || isDateUnavailable(date)
                    }}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                  />
                  <div className="p-3 border-t border-border">
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded-sm mr-2"></div>
                      <span>Unavailable - Already booked</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {existingBookings.length > 0 && (
              <Alert variant="warning" className="bg-yellow-50 dark:bg-yellow-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This car has {existingBookings.length} existing bookings. Unavailable dates are marked in the
                  calendar.
                </AlertDescription>
              </Alert>
            )}

            {startDate && endDate && (
              <div className="border-t border-b py-4 my-4">
                <div className="flex justify-between mb-2">
                  <span>Price per day</span>
                  <span>{safeFormatCurrency(pricePerDay)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Days</span>
                  <span>{calculateDays()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{safeFormatCurrency(totalPrice)}</span>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm text-red-600 dark:text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full"
              onClick={handleBooking}
              disabled={!startDate || !endDate || isLoading || isLoadingBookings}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Book Now"
              )}
            </Button>

            {error && (
              <div className="text-center mt-2">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="text-xs">
                  Refresh Page
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      {showSuccess && bookingConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 z-50">
          <BookingSuccess onComplete={() => router.push(`/dashboard/bookings/${bookingConfirmation.id}`)} />
        </div>
      )}
    </div>
  )
}
