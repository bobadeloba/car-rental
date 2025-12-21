"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createBrowserClient } from "@/lib/supabase/client"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface User {
  id: string
  full_name: string
  email: string
}

interface Car {
  id: string
  name: string
  brand: string
  price_per_day: number
  availability_status?: string
}

interface BookingCreateFormProps {
  users: User[]
  cars: Car[]
}

// Create a schema that enforces end_date is after start_date
const formSchema = z
  .object({
    user_id: z.string().uuid(),
    car_id: z.string().uuid(),
    start_date: z.date(),
    end_date: z.date(),
    status: z.string(),
    pickup_location: z.string().optional(),
    return_location: z.string().optional(),
    notes: z.string().optional(),
    extras_price: z.coerce.number().min(0).optional(),
    discount: z.coerce.number().min(0).max(100).optional(),
  })
  .refine(
    (data) => {
      return data.end_date >= data.start_date
    },
    {
      message: "End date must be after or equal to start date",
      path: ["end_date"], // This shows the error on the end_date field
    },
  )

export default function BookingCreateForm({ users, cars }: BookingCreateFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCarRate, setSelectedCarRate] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)

  // Set up default start date (today) and end date (today + 3 days)
  const today = new Date()
  const threeDaysLater = new Date(today)
  threeDaysLater.setDate(today.getDate() + 3)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: users.length > 0 ? users[0]?.id : "",
      car_id: "",
      start_date: today,
      end_date: threeDaysLater,
      status: "pending",
      pickup_location: "Main Office",
      return_location: "Main Office",
      notes: "",
      extras_price: 0,
      discount: 0,
    },
  })

  // Reset form when users or cars change
  useEffect(() => {
    if (users.length > 0) {
      form.setValue("user_id", users[0]?.id || "")
    }
  }, [users, form])

  const watchStartDate = form.watch("start_date")
  const watchEndDate = form.watch("end_date")
  const watchCarId = form.watch("car_id")
  const watchExtrasPrice = form.watch("extras_price")
  const watchDiscount = form.watch("discount")

  // Update car rate when car selection changes
  const handleCarChange = (value: string) => {
    form.setValue("car_id", value)
    const selectedCar = cars.find((car) => car.id === value)
    if (selectedCar) {
      setSelectedCarRate(selectedCar.price_per_day)
    }
  }

  // Calculate days between two dates
  const calculateDays = (start: Date, end: Date) => {
    if (!start || !end) return 0
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1 // Minimum 1 day
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!watchStartDate || !watchEndDate || !selectedCarRate) return 0

    const days = calculateDays(watchStartDate, watchEndDate)
    const extrasPrice = Number(watchExtrasPrice || 0)
    const discountPercent = Number(watchDiscount || 0)

    // Calculate subtotal (before discount)
    const subtotal = days * selectedCarRate + extrasPrice

    // Apply discount
    const discountValue = subtotal * (discountPercent / 100)
    return subtotal - discountValue
  }

  const totalPrice = calculateTotalPrice()
  const days = watchStartDate && watchEndDate ? calculateDays(watchStartDate, watchEndDate) : 0
  const subtotal = days * selectedCarRate + Number(watchExtrasPrice || 0)
  const discountAmount = subtotal * (Number(watchDiscount || 0) / 100)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // Ensure start date is not after end date
      if (values.start_date > values.end_date) {
        setFormError("Start date must be before end date")
        return
      }

      // Calculate total price
      const days = calculateDays(values.start_date, values.end_date)
      const extrasPrice = Number(values.extras_price || 0)
      const discountPercent = Number(values.discount || 0)

      // Calculate subtotal (before discount)
      const subtotal = days * selectedCarRate + extrasPrice

      // Apply discount
      const discountValue = subtotal * (discountPercent / 100)
      const totalPrice = subtotal - discountValue

      // Format dates for database - ensure consistent YYYY-MM-DD format
      const formatDateForDB = (date: Date) => {
        const d = new Date(date)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      }

      const formattedStartDate = formatDateForDB(values.start_date)
      const formattedEndDate = formatDateForDB(values.end_date)

      console.log("Creating booking with dates:", { start: formattedStartDate, end: formattedEndDate })

      // Create booking
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: values.user_id,
          car_id: values.car_id,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          status: values.status,
          pickup_location: values.pickup_location,
          return_location: values.return_location,
          notes: values.notes,
          additional_charges: extrasPrice,
          discount: discountPercent,
          total_price: totalPrice,
        })
        .select()
        .single()

      if (error) {
        console.error("Database error:", error)
        if (error.message.includes("valid_date_range")) {
          setFormError("Invalid date range: End date must be after or equal to start date.")
        } else {
          setFormError(`Error creating booking: ${error.message}`)
        }
        return
      }

      // Add to booking history
      if (booking) {
        await supabase.from("booking_history").insert({
          booking_id: booking.id,
          status: "created",
          notes:
            discountPercent > 0
              ? `Booking created by admin with ${discountPercent}% discount`
              : "Booking created by admin",
        })

        // Update car status if booking is confirmed
        if (values.status === "confirmed") {
          await supabase.from("cars").update({ availability_status: "rented" }).eq("id", values.car_id)
        }

        toast({
          title: "Booking created",
          description: "The booking has been successfully created.",
        })

        router.push(`/admin/bookings/${booking.id}`)
        router.refresh()
      } else {
        throw new Error("Failed to create booking - no data returned")
      }
    } catch (error: any) {
      console.error("Error creating booking:", error)
      setFormError(error.message || "Failed to create booking. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users && users.length > 0 ? (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email || "Unnamed User"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled>
                          No users available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="car_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <Select onValueChange={handleCarChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cars && cars.length > 0 ? (
                        cars.map((car) => (
                          <SelectItem key={car.id} value={car.id}>
                            {car.brand} {car.name} (${car.price_per_day?.toFixed(2) || "0.00"}/day)
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-cars" disabled>
                          No vehicles available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? new Date(field.value).toLocaleDateString() : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date)
                            // If end date is before new start date, update end date
                            const endDate = form.getValues("end_date")
                            if (date && endDate && date > endDate) {
                              // Set end date to start date + 1 day
                              const newEndDate = new Date(date)
                              newEndDate.setDate(date.getDate() + 1)
                              form.setValue("end_date", newEndDate)
                            }
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? new Date(field.value).toLocaleDateString() : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues("start_date")
                            return startDate && date < startDate
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickup_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Office" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="return_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Office" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="extras_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Charges ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional notes here..." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mt-4">
              <div className="text-sm font-medium mb-2">Booking Summary</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Daily Rate</span>
                  <span className="text-sm font-medium">${selectedCarRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Duration</span>
                  <span className="text-sm font-medium">{days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Additional Charges</span>
                  <span className="text-sm font-medium">${Number(watchExtrasPrice || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Discount ({Number(watchDiscount || 0)}%)</span>
                  <span className="text-sm font-medium text-green-600">-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-sm font-medium">Total Price</span>
                  <span className="text-sm font-bold">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/bookings")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Booking
          </Button>
        </div>
      </form>
    </Form>
  )
}
