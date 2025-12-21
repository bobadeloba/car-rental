"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClientComponentClient } from "@/lib/supabase/client"
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
import { Card, CardContent } from "@/components/ui/card"
import { formatPPP, differenceInDays, addDays } from "@/lib/date-utils"

interface Car {
  id: string
  name: string
  brand: string
  price_per_day: number
  availability_status?: string
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
  cars: Car
}

interface BookingEditFormProps {
  booking: Booking
  cars: Car[]
}

const formSchema = z.object({
  car_id: z.string().uuid(),
  start_date: z.date(),
  end_date: z.date(),
  pickup_location: z.string().min(3, "Pickup location must be at least 3 characters").max(100),
  return_location: z.string().min(3, "Return location must be at least 3 characters").max(100),
  notes: z.string().optional(),
})

export function BookingEditForm({ booking, cars }: BookingEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize with the current car's price
  const [selectedCarRate, setSelectedCarRate] = useState(
    booking.cars?.price_per_day ? Number(booking.cars.price_per_day) : 0,
  )

  // State for booking summary
  const [duration, setDuration] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      car_id: booking.car_id,
      start_date: new Date(booking.start_date),
      end_date: new Date(booking.end_date),
      pickup_location: booking.pickup_location || "",
      return_location: booking.return_location || "",
      notes: booking.notes || "",
    },
  })

  const watchStartDate = form.watch("start_date")
  const watchEndDate = form.watch("end_date")
  const watchCarId = form.watch("car_id")

  // Update selected car rate when car changes
  const handleCarChange = (carId: string) => {
    const selectedCar = cars.find((car) => car.id === carId)
    if (selectedCar && selectedCar.price_per_day) {
      setSelectedCarRate(Number(selectedCar.price_per_day))
    }
    form.setValue("car_id", carId)

    // Recalculate total price
    if (watchStartDate && watchEndDate) {
      const days = Math.max(1, differenceInDays(watchEndDate, watchStartDate))
      setDuration(days)
      const newTotal = days * (selectedCar?.price_per_day || selectedCarRate)
      setTotalPrice(newTotal)
    }
  }

  // Update booking summary when dates change
  const handleDateChange = (field: "start_date" | "end_date", value: Date) => {
    form.setValue(field, value)

    const startDate = field === "start_date" ? value : watchStartDate
    const endDate = field === "end_date" ? value : watchEndDate

    if (startDate && endDate) {
      const days = Math.max(1, differenceInDays(endDate, startDate))
      setDuration(days)
      const newTotal = days * selectedCarRate
      setTotalPrice(newTotal)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (new Date(values.start_date) >= new Date(values.end_date)) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate total price
      const days = Math.max(1, differenceInDays(values.end_date, values.start_date))
      const totalPrice = days * selectedCarRate

      // Prepare update data
      const updateData = {
        car_id: values.car_id,
        start_date: values.start_date.toISOString().split("T")[0],
        end_date: values.end_date.toISOString().split("T")[0],
        pickup_location: values.pickup_location,
        return_location: values.return_location,
        notes: values.notes,
        total_price: totalPrice,
      }

      // Update booking
      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", booking.id)
        .eq("user_id", booking.user_id)

      if (error) {
        throw error
      }

      toast({
        title: "Booking updated",
        description: "Your booking has been successfully updated.",
      })

      router.push(`/dashboard/bookings/${booking.id}`)
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

  // Initialize booking summary on component mount
  if (watchStartDate && watchEndDate && duration === 0) {
    const days = Math.max(1, differenceInDays(watchEndDate, watchStartDate))
    setDuration(days)
    setTotalPrice(days * selectedCarRate)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="car_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <Select defaultValue={field.value} onValueChange={handleCarChange}>
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
                            {field.value ? formatPPP(field.value) : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => date && handleDateChange("start_date", date)}
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
                            {field.value ? formatPPP(field.value) : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => date && handleDateChange("end_date", date)}
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

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any special requests or notes here..."
                      className="min-h-[120px]"
                      {...field}
                    />
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
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium">Total Price</span>
                    <span className="text-sm font-bold">${Number(totalPrice).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground mt-4">
              <p>
                <strong>Note:</strong> Changes to your booking are subject to car availability and pricing.
                Modifications may result in price adjustments.
              </p>
              <p className="mt-2">
                Current Status: <span className="font-medium capitalize">{booking.status}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}>
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
