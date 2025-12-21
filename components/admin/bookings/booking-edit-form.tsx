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
import { format, differenceInDays, addDays } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

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
  availability_status: string
}

interface Booking {
  id: string
  user_id: string
  car_id: string
  start_date: string
  end_date: string
  total_price: number
  status: string
  pickup_location?: string
  return_location?: string
  notes?: string
  additional_charges?: number
  discount?: number
  users: {
    full_name: string
    email: string
  }
  cars: {
    name: string
    brand: string
    price_per_day: number
  }
}

interface BookingEditFormProps {
  booking: Booking
  users: User[]
  cars: Car[]
}

const formSchema = z.object({
  user_id: z.string().uuid(),
  car_id: z.string().uuid(),
  start_date: z.date(),
  end_date: z.date(),
  status: z.string(),
  pickup_location: z.string().optional(),
  return_location: z.string().optional(),
  notes: z.string().optional(),
  additional_charges: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
})

export default function BookingEditForm({ booking, users, cars }: BookingEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize with a default value if price_per_day is undefined
  const [selectedCarRate, setSelectedCarRate] = useState(
    booking.cars?.price_per_day ? Number(booking.cars.price_per_day) : 0,
  )

  // State for booking summary
  const [duration, setDuration] = useState(0)
  const [additionalCharges, setAdditionalCharges] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: booking.user_id,
      car_id: booking.car_id,
      start_date: new Date(booking.start_date),
      end_date: new Date(booking.end_date),
      status: booking.status,
      pickup_location: booking.pickup_location || "",
      return_location: booking.return_location || "",
      notes: booking.notes || "",
      additional_charges: booking.additional_charges || 0,
      discount: booking.discount || 0,
    },
  })

  const watchStartDate = form.watch("start_date")
  const watchEndDate = form.watch("end_date")
  const watchCarId = form.watch("car_id")
  const watchAdditionalCharges = form.watch("additional_charges")
  const watchDiscount = form.watch("discount")

  // Update selected car rate when car changes
  useEffect(() => {
    if (watchCarId !== booking.car_id) {
      const selectedCar = cars.find((car) => car.id === watchCarId)
      if (selectedCar && selectedCar.price_per_day !== selectedCarRate) {
        setSelectedCarRate(Number(selectedCar.price_per_day))
      }
    }
  }, [watchCarId, booking.car_id, cars, selectedCarRate])

  // Update booking summary when relevant values change
  useEffect(() => {
    if (watchStartDate && watchEndDate) {
      const days = Math.max(1, differenceInDays(watchEndDate, watchStartDate))
      setDuration(days)

      const charges = Number(watchAdditionalCharges || 0)
      setAdditionalCharges(charges)

      const discountAmount = Number(watchDiscount || 0)
      setDiscount(discountAmount)

      // Calculate subtotal (before discount)
      const subtotal = days * selectedCarRate + charges

      // Apply discount
      const discountValue = subtotal * (discountAmount / 100)
      const total = subtotal - discountValue

      setTotalPrice(total)
    }
  }, [watchStartDate, watchEndDate, watchAdditionalCharges, watchDiscount, selectedCarRate])

  // Initialize booking summary on component mount
  useEffect(() => {
    if (booking.start_date && booking.end_date) {
      const startDate = new Date(booking.start_date)
      const endDate = new Date(booking.end_date)
      const days = Math.max(1, differenceInDays(endDate, startDate))
      setDuration(days)

      const charges = Number(booking.additional_charges || 0)
      setAdditionalCharges(charges)

      const discountAmount = Number(booking.discount || 0)
      setDiscount(discountAmount)

      // Calculate subtotal (before discount)
      const subtotal = days * selectedCarRate + charges

      // Apply discount
      const discountValue = subtotal * (discountAmount / 100)
      const total = subtotal - discountValue

      setTotalPrice(total)
    }
  }, [booking, selectedCarRate])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Calculate total price
      const days = Math.max(1, differenceInDays(values.end_date, values.start_date))
      const additionalCharges = Number(values.additional_charges || 0)
      const discountPercent = Number(values.discount || 0)

      // Calculate subtotal (before discount)
      const subtotal = days * selectedCarRate + additionalCharges

      // Apply discount
      const discountValue = subtotal * (discountPercent / 100)
      const totalPrice = subtotal - discountValue

      // Prepare update data
      const updateData = {
        user_id: values.user_id,
        car_id: values.car_id,
        start_date: format(values.start_date, "yyyy-MM-dd"),
        end_date: format(values.end_date, "yyyy-MM-dd"),
        status: values.status,
        pickup_location: values.pickup_location,
        return_location: values.return_location,
        notes: values.notes,
        additional_charges: additionalCharges,
        discount: discountPercent,
        total_price: totalPrice,
      }

      // Log the update data for debugging
      console.log("Updating booking with data:", updateData)

      // Update booking
      const { error } = await supabase.from("bookings").update(updateData).eq("id", booking.id)

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      // Add to booking history
      await supabase.from("booking_history").insert({
        booking_id: booking.id,
        status: "modified",
        notes: `Booking details updated by admin. Discount applied: ${discountPercent}%`,
      })

      toast({
        title: "Booking updated",
        description: "The booking has been successfully updated.",
      })

      router.push(`/admin/bookings/${booking.id}`)
      router.refresh()
    } catch (error: any) {
      console.error("Error updating booking:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cars.map((car) => (
                        <SelectItem
                          key={car.id}
                          value={car.id}
                          disabled={car.availability_status === "rented" && car.id !== booking.car_id}
                        >
                          {car.brand} {car.name} (${Number(car.price_per_day || 0).toFixed(2)}/day)
                        </SelectItem>
                      ))}
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
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < addDays(new Date(), -1)}
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
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < watchStartDate}
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
                name="additional_charges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Charges ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          // Update the additionalCharges state when the input changes
                          setAdditionalCharges(Number(e.target.value) || 0)
                        }}
                      />
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
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          // Update the discount state when the input changes
                          setDiscount(Number(e.target.value) || 0)
                        }}
                      />
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

            <Card className="mt-4">
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-2">Booking Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Daily Rate</span>
                    <span className="text-sm font-medium">${Number(selectedCarRate).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium">{duration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Additional Charges</span>
                    <span className="text-sm font-medium">${Number(additionalCharges).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-sm font-medium">
                      ${(duration * selectedCarRate + Number(additionalCharges)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Discount ({discount}%)</span>
                    <span className="text-sm font-medium text-green-600">
                      -${((duration * selectedCarRate + Number(additionalCharges)) * (discount / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium">Total Price</span>
                    <span className="text-sm font-bold">${Number(totalPrice).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/bookings/${booking.id}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Booking
          </Button>
        </div>
      </form>
    </Form>
  )
}
