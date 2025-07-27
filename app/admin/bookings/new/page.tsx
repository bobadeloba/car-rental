import { cookies } from "next/headers"
import BookingCreateForm from "@/components/admin/bookings/booking-create-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata("Create New Booking | Admin Dashboard", "Create a new booking for a customer")
}

export default async function NewBookingPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Fetch all users for dropdown
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, email")
      .order("full_name")

    if (usersError) {
      console.error("Error fetching users:", usersError)
    }

    // Fetch all cars for dropdown - simplified query
    const { data: cars, error: carsError } = await supabase
      .from("cars")
      .select("id, name, brand, price_per_day")
      .eq("availability_status", "available")
      .order("brand")

    if (carsError) {
      console.error("Error fetching cars:", carsError)
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/bookings">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Bookings
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create New Booking</h1>
        </div>

        <BookingCreateForm users={users || []} cars={cars || []} />
      </div>
    )
  } catch (error) {
    console.error("Error loading new booking page:", error)
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/bookings">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Bookings
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create New Booking</h1>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error loading booking form</h3>
          <p className="text-red-700 dark:text-red-300 mt-1">
            There was a problem loading the booking form. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}
